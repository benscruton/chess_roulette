import {useState, useEffect} from "react";
import Axios from "axios";
import styles from "./GameBoard.module.css";
import images from "./ImageSets/standardChess";
import PawnPromotion from "./PawnPromotion";
import ConfirmResign from "./ConfirmResign";


const GameBoard = ({socket, loggedIn, statusFromParent, gameId, gameType, specialInfo, begun, endGame, finished, playerIds, spriteStyle, moveLog, setMoveLog, offerDraw, drawOfferPending}) => {

  // const moveLogic = require(`./MoveUtils/${gameType ? gameType : "standardChess"}/MoveLogic`);
  
  const [availableMoves, setAvailableMoves] = useState(false);
  const [boardStatus, setBoardStatus] = useState(statusFromParent);
  const [whiteToPlay, setWhiteToPlay] = useState(true);
  const [activeTile, setActiveTile] = useState(false);
  const [info, setInfo] = useState(specialInfo);
  const [viewAsBlack, setViewAsBlack] = useState(false);
  const [size, setSize] = useState("full");
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  // const fileArray = ["A", "B", "C", "D", "E", "F", "G", "H"];

  useEffect( () => {
    Axios.get(`http://localhost:8000/api/games/${gameId}`)
      .then(res => {
        setWhiteToPlay(res.data.results.whiteToPlay);
      }).catch(err => console.error(err.errors));
  }, [gameId]);
  
  useEffect( () => {
    setBoardStatus(statusFromParent);
  }, [statusFromParent]);

  useEffect( () => {
    setActiveTile(false);
    setAvailableMoves(false);
  }, [begun]);

  useEffect( () => {
    setInfo({...specialInfo});
  }, [specialInfo]);

  useEffect( () => {
    if(loggedIn._id === playerIds.black){
      setViewAsBlack(loggedIn._id !== playerIds.white);
    }else{
      setViewAsBlack(false);
    }
  }, [begun]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- BOARD SIZING ----------
  const adjustBoardSize = () => {
    if(window.innerWidth > 600){
      setSize("full");
    } else if(window.innerWidth > 400){
      setSize("large");
    } else if(window.innerWidth > 320){
      setSize("medium");
    } else {
      setSize("small");
    }
  };

  useEffect( () => {
    adjustBoardSize();
    window.addEventListener("resize", adjustBoardSize);
    return () => window.removeEventListener("resize", adjustBoardSize);
  }, []);

  // ---------- RECEIVE FROM SOCKET ----------
  useEffect( () => {
    socket.on("newMoveCameIn", data => {
      setBoardStatus(data.boardStatus);
      setInfo(data.info);
      setWhiteToPlay(data.whiteToPlay);
      setMoveLog(data.moveLog);
      setActiveTile(false);
      setAvailableMoves(false);
    });
    socket.on("gameFinished", () => {
      setShowResignConfirm(false);
    });
    return () => {
      socket.removeAllListeners("newMoveCameIn");
      socket.removeAllListeners("gameFinished");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---------- GAMEPLAY ----------

  const clickTile = (tile) => {

    const additionalData = {
      activeTile,
      availableMoves,
      boardStatus,
      endGame,
      info,
      moveLog,
      whiteToPlay,
    };

    const offScreenFunctions = require("./MoveUtils")[gameType];


    // clicked on a green square:
    if(isValidMove(tile) && !info.pawnReady){
      // Make sure 1) game has begun, 2) it is their turn, and 3) it's the right player
      if(begun && !finished.length && !drawOfferPending
        && (activeTile.occupied.color === "white") - (whiteToPlay) === 0
        && playerIds[whiteToPlay ? "white" : "black"] === loggedIn._id
      ){

        const results = offScreenFunctions.doMove(tile, additionalData);
        const {
          boardStatus,
          moveLog,
          whiteToPlay,
          info,
          gameFinished
        } = results;

        // Update all front-end info:
        setBoardStatus(boardStatus);
        setActiveTile(false);
        setAvailableMoves(false);
        setMoveLog(moveLog);
        setWhiteToPlay(whiteToPlay);
        setInfo(info);

        // send move to database:
        let databaseInfo = {
          boardStatus,
          whiteToPlay,
          moveLog,
          $set: {
            "specialInfo.castlingLegal": info.castlingLegal,
            "specialInfo.enPassantAvailable": info.enPassantAvailable,
            "specialInfo.pawnReady": info.pawnReady,
            "specialInfo.kingLocations": info.kingLocations,
            "specialInfo.inCheck": info.inCheck
          }
        };
        Axios.put(`http://localhost:8000/api/games/${gameId}`, databaseInfo, {withCredentials: true})
          .catch(err => console.error({errors: err}));

        let socketInfo = {
          gameId,
          boardStatus,
          whiteToPlay,
          info,
          moveLog,
        }
        socket.emit("madeAMove", socketInfo);

        // End game, if applicable:
        if(!info.pawnReady && gameFinished.length){
          endGame(gameFinished);
        }

      } else { // green square but not a valid move:
        setActiveTile(false);
        setAvailableMoves(false);
      }
    }

    // clicked on a piece that isn't already active:
    else if(tile.occupied && !(tile.file === activeTile.file && tile.rank === activeTile.rank)){
      
      // GET THE POSSIBLE MOVES FOR THIS PIECE HERE

      setActiveTile(tile);
      let moves = offScreenFunctions.getMoves(tile, additionalData);
      setAvailableMoves(moves);


    }

    // clicked on the active square, or an empty square:
    else {
      setActiveTile(false);
      setAvailableMoves(false);
    }
  };

  const isValidMove = tile => {
    for(let i=0; i<availableMoves.length; i++){
      if(availableMoves[i][0] === tile.file && availableMoves[i][1] === tile.rank) return true;
    }
    return false;
  };

  const promotePawn = (tileCopy, choice) => {
    if(playerIds[whiteToPlay ? "white" : "black"] !== loggedIn._id){
      return;
    }

    const offScreenFunctions = require("./MoveUtils")[gameType];

    const additionalData = {
      boardStatus,
      info,
      moveLog,
      whiteToPlay
    };

    const results = offScreenFunctions.promotePawn(tileCopy, choice, additionalData);

    console.log(results);
    const {
      updatedBoard,
      updatedMoveLog,
      updatedWhiteToPlay,
      updatedSpecialInfo,
      gameFinished
    } = results;

    setBoardStatus(updatedBoard);
    setMoveLog(updatedMoveLog);
    setInfo(updatedSpecialInfo);
    setWhiteToPlay(updatedWhiteToPlay);

    let databaseInfo = {
      boardStatus: updatedBoard,
      whiteToPlay: updatedWhiteToPlay,
      moveLog: updatedMoveLog,
      $set: {
        "specialInfo.pawnReady": updatedSpecialInfo.pawnReady,
        "specialInfo.inCheck": updatedSpecialInfo.inCheck
      }
    }
    Axios.put(`http://localhost:8000/api/games/${gameId}`, databaseInfo, {withCredentials: true})
        .catch(err => console.error({errors: err}))
    
    let socketInfo = {
      gameId,
      boardStatus: updatedBoard,
      whiteToPlay: updatedWhiteToPlay,
      info: updatedSpecialInfo,
      moveLog: updatedMoveLog,
    }
    socket.emit("madeAMove", socketInfo);


    if(gameFinished.length){
      endGame(gameFinished);
    }
  };

  // ---------- ENDING GAMES ----------

  const resign = () => {
    if((playerIds.white !== loggedIn._id && playerIds.black !== loggedIn._id)
      || finished.length
    ){
      return;
    }
    let message = `${loggedIn.userName} resigned.`;
    if(playerIds.white !== loggedIn._id){
      message += " White wins!";
    }
    else if(playerIds.black !== loggedIn._id){
      message += " Black wins!";
    }
    endGame(message);
    setShowResignConfirm(false);
  };

  return (
    <div id="board">
      <h3>
        {begun?
          finished.length?
            finished
            :
            `${whiteToPlay? "White" : "Black"}${info.inCheck? " is in check" : "'s move"}`
          :
          "Not Started"
        }
      </h3>

      {info.pawnReady && playerIds[whiteToPlay ? "white" : "black"] === loggedIn._id?
        <PawnPromotion
          images={images}
          spriteStyle={spriteStyle}
          whiteToPlay={whiteToPlay}
          tile={info.pawnReady}
          promotePawn={promotePawn}
        />
        :
        <></>
      }

      {showResignConfirm?
        <ConfirmResign
          resign={resign}
          hide={() => setShowResignConfirm(false)}
        />
        :
        <></>
      }

      <div className={viewAsBlack? styles.boardContainerBlack : styles.boardContainerWhite}>
        {boardStatus?
          boardStatus.map( (row, i) =>
            <div className={viewAsBlack? styles.tileRowBlack : styles.tileRowWhite} key={i}>
              {row.map( (tile, j) =>
                <div
                  className={`
                    ${styles[`${size}Tile`]}
                    ${(i+j) % 2 === 0? styles.white : styles.black}
                    ${activeTile.file === tile.file && activeTile.rank === tile.rank ? styles.active : ""}
                    ${isValidMove(tile) ? 
                      (tile.occupied ||(tile.file === info.enPassantAvailable[0] && tile.rank === info.enPassantAvailable[1] && activeTile.occupied.type === "pawn")) ?
                        styles.capture : styles.available
                      : ""}
                  `} 
                  key={j}
                  id={`${tile.file}${tile.rank}`}
                  onClick={() => clickTile(tile)}
                >
                
                  {tile.occupied? 
                    <img 
                      src={images[`${tile.occupied.color}${tile.occupied.type}${spriteStyle}`]} 
                      alt={`${tile.occupied.color[0]} ${tile.occupied.abbrev}`}
                      className={styles[`${size}Piece`]}
                    />
                    : 
                    " "
                  }
                </div>
              )}
            </div>
          )
          :
          <p>Loading...</p>
        }
      </div>

      {begun && !finished && (playerIds.white === loggedIn._id || playerIds.black === loggedIn._id)?
        <div className="col-12">
          <button
            className="btn btn-warning my-2 mx-1"
            value={true}
            onClick={offerDraw}
          >
            Offer draw
          </button>
          
          <button
            className="btn btn-danger my-2 mx-1"
            onClick = {() => setShowResignConfirm(true)}
          >
            Resign
          </button>
        </div>
        :
        <></>
      }

      <button
        className="btn btn-info my-2 mx-1"
        onClick = {() => setViewAsBlack(!viewAsBlack)}
      >
        Rotate board
      </button>
      
    </div>
  );
}

export default GameBoard;