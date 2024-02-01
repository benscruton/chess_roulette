import {useState, useEffect, useContext} from "react";
import axios from "axios";
import styles from "./GameBoard.module.css";
import images from "./ImageSets/standardChess";
import AppContext from "../../context/AppContext";
import PiecePromotion from "./PiecePromotion";
import ConfirmResign from "./ConfirmResign";
import gameTypes from "./GameTypes";

const GameBoard = ({socket, loggedIn, origLastMove, origStatus, gameId, gameType, specialInfo, begun, endGame, finished, playerIds, spriteStyle, moveLog, setMoveLog, offerDraw, drawOfferPending}) => {
  const {serverUrl} = useContext(AppContext);
  
  const [availableMoves, setAvailableMoves] = useState(false);
  const [boardStatus, setBoardStatus] = useState(origStatus);
  const [whiteToPlay, setWhiteToPlay] = useState(true);
  const [activeTile, setActiveTile] = useState(false);
  const [lastMove, setLastMove] = useState(origLastMove);
  const [info, setInfo] = useState(specialInfo);
  const [viewAsBlack, setViewAsBlack] = useState(false);
  const [size, setSize] = useState("full");
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  const gameplayUtils = gameTypes[gameType];

  useEffect( () => {
    axios.get(`${serverUrl}/api/games/${gameId}`)
      .then(res => {
        setWhiteToPlay(res.data.results.whiteToPlay);
      }).catch(err => console.error(err.errors));
  }, [gameId, serverUrl]);
  
  useEffect( () => {
    setBoardStatus(origStatus);
  }, [origStatus]);

  useEffect( () => {
    setLastMove(origLastMove);
  }, [origLastMove]);

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
    } else if(window.innerWidth > 440){
      setSize("large");
    } else if(window.innerWidth > 350){
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
      setLastMove(data.lastMove);
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
      info,
      moveLog,
      whiteToPlay,
    };

    // clicked on a green square:
    if(isValidMove(tile) && !info.pawnReady){
      // Make sure 1) game has begun, 2) it is their turn, and 3) it's the right player
      if(begun && !finished.length && !drawOfferPending
        && (activeTile.occupied.color === "white") - (whiteToPlay) === 0
        && playerIds[whiteToPlay ? "white" : "black"] === loggedIn._id
      ){
        const {
          boardStatus,
          moveLog,
          whiteToPlay,
          info,
          lastMove,
          gameFinished
        } = gameplayUtils.clickUtils.doMove(tile, additionalData);

        let dbSet = {
          "specialInfo.castlingLegal": info.castlingLegal,
          "specialInfo.enPassantAvailable": info.enPassantAvailable,
          "specialInfo.pawnReady": info.pawnReady,
          "specialInfo.kingLocations": info.kingLocations,
          "specialInfo.inCheck": info.inCheck
        };

        updateGameStatus(boardStatus, moveLog, whiteToPlay, info, dbSet, lastMove, gameFinished);
      }
      else { // green square but not a valid move:
        setActiveTile(false);
        setAvailableMoves(false);
      }
    }

    // clicked on a piece that isn't already active:
    else if(tile.occupied && !(tile.file === activeTile.file && tile.rank === activeTile.rank)){
      setActiveTile(tile);
      let moves = gameplayUtils.clickUtils.getMoves(tile, additionalData);
      setAvailableMoves(moves);
      setLastMove([]);
    }

    // clicked on the active square, or an empty square:
    else {
      setActiveTile(false);
      setAvailableMoves(false);
      setLastMove([]);
    }
  };

  const isValidMove = tile => {
    for(let i=0; i<availableMoves.length; i++){
      if(availableMoves[i][0] === tile.file && availableMoves[i][1] === tile.rank) return true;
    }
    return false;
  };

  const involvedInLastMove = tile => {
    for(let i=0; i<lastMove.length; i++){
      if(lastMove[i][0] === tile.file && lastMove[i][1] === tile.rank) return true;
    }
    return false;
  }

  const promotePiece = (tileCopy, choice) => {
    if(playerIds[whiteToPlay ? "white" : "black"] !== loggedIn._id){
      return;
    }
    const additionalData = { boardStatus, info, moveLog, whiteToPlay};
    const {
      updatedBoard,
      updatedMoveLog,
      updatedWhiteToPlay,
      updatedSpecialInfo,
      gameFinished
    } = gameplayUtils.clickUtils.promotePiece(tileCopy, choice, additionalData);

    const dbSet = {
      "specialInfo.pawnReady": updatedSpecialInfo.pawnReady,
      "specialInfo.inCheck": updatedSpecialInfo.inCheck
    };

    updateGameStatus(
      updatedBoard,
      updatedMoveLog,
      updatedWhiteToPlay,
      updatedSpecialInfo,
      dbSet,
      lastMove,
      gameFinished
    );
  };

  const updateGameStatus = (board, log, turn, spInfo, dbSet, last, finished) => {
    // Update all front-end info:
    setBoardStatus(board);
    setMoveLog(log);
    setWhiteToPlay(turn);
    setInfo(spInfo);
    setLastMove(last);
    setActiveTile(false);
    setAvailableMoves(false);

    // send move to database:
    let databaseInfo = {
      boardStatus: board,
      lastMove: last,
      whiteToPlay: turn,
      moveLog: log,
      $set: dbSet
    };
    axios.put(`${serverUrl}/api/games/${gameId}`, databaseInfo, {withCredentials: true})
      .catch(err => console.error({errors: err}));

    // send move to socket
    let socketInfo = {
      gameId,
      boardStatus: board,
      lastMove: last,
      whiteToPlay: turn,
      info: spInfo,
      moveLog: log,
    }
    socket.emit("madeAMove", socketInfo);

    if(!spInfo.pawnReady && finished.length){
      endGame(finished);
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

  const labelSquare = (text, orientation, idx) => (
    <div
      key={idx}
      className={`
        ${styles.boardLabel}
        ${styles[`${size}${orientation}Label`]}
      `}
    >
      {text}
    </div>
  );
  
  const labelRow = viewStyle => (
    boardStatus ? 
      <div className={styles[viewStyle]}>
        {labelSquare("", "Corner")}
        {boardStatus[0].map( (tile, idx) => 
          labelSquare(tile.file, "Horizontal", idx)
        )}
        {labelSquare("", "Corner")}
      </div>
      :
      <></>
  );

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
        <PiecePromotion
          images={images}
          spriteStyle={spriteStyle}
          size={size}
          gameType={gameType}
          whiteToPlay={whiteToPlay}
          tile={info.pawnReady}
          promotePiece={promotePiece}
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
        {viewAsBlack ? labelRow("tileRowBlack") : <></>}

        {boardStatus?
          boardStatus.map( (row, i) =>
            <div className={viewAsBlack? styles.tileRowBlack : styles.tileRowWhite} key={i}>
              {labelSquare(row[0].rank, "Vertical")}

              {row.map( (tile, j) =>
                <div
                  className={`
                    ${styles[`${size}Tile`]}
                    ${(i+j) % 2 === 0? styles.white : styles.black}
                    ${involvedInLastMove(tile) ? styles.lastMove : ""}
                    ${activeTile.file === tile.file && activeTile.rank === tile.rank ? styles.active : ""}
                    ${isValidMove(tile) ? 
                      (tile.occupied || (tile.file === info.enPassantAvailable[0] && tile.rank === info.enPassantAvailable[1] && activeTile.occupied.type === "pawn")) ?
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

              {labelSquare(row[0].rank, "Vertical")}
            </div>
          )
          :
          <p>Loading...</p>
        }

        {viewAsBlack ? <></> : labelRow("tileRowWhite")}
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