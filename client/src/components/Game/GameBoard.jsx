import {useState, useEffect} from "react";
import Axios from "axios";
import styles from "./GameBoard.module.css";
import images from "./ImageSets/standardChess";
import PawnPromotion from "./PawnPromotion";
const rules = require("./MoveLogic/StandardChess/standardChessMoves");

const GameBoard = ({socket, statusFromParent, gameId, specialInfo, begun, playerIds, spriteStyle, loggedIn, moveLog, setMoveLog}) => {

  const [availableMoves, setAvailableMoves] = useState(false);
  const [thisUserMoves, setThisUserMoves] = useState(0);
  const [boardStatus, setBoardStatus] = useState(statusFromParent);
  const [whiteToPlay, setWhiteToPlay] = useState(true);
  const [activeTile, setActiveTile] = useState(false);
  const [info, setInfo] = useState({});
  const [viewAsBlack, setViewAsBlack] = useState(false);

  useEffect( () => {
    Axios.get(`http://localhost:8000/api/games/${gameId}`)
      .then(res => {
        setWhiteToPlay(res.data.results.whiteToPlay);
      }).catch(err => console.error(err.errors));
  }, [gameId])
  
  useEffect( () => {
    setBoardStatus(statusFromParent);
  }, [statusFromParent])

  useEffect( () => {
    setInfo({...specialInfo});
  }, [specialInfo]);

  useEffect( () => {
    if(loggedIn._id === playerIds.black){
      setViewAsBlack(loggedIn._id !== playerIds.white);
    }else{
      setViewAsBlack(false);
    }
  }, [playerIds]);

  // --------------- SOCKET FUNCTIONS: ----------------
  // every time we make a move, send to socket
  useEffect( () => {
    if(boardStatus !== false){
      socket.emit("madeAMove", {gameId, boardStatus, whiteToPlay, info, moveLog});
    }
  }, [thisUserMoves])

  // when a new move comes in, update the board status
  useEffect( () => {
    socket.on("newMoveCameIn", data => {
      console.log("received a thing");
      setBoardStatus(data.boardStatus);
      setInfo(data.info);
      setWhiteToPlay(data.whiteToPlay);
      setMoveLog(data.moveLog);
      setActiveTile(false);
      setAvailableMoves(false);
    });
    return () => socket.disconnect(true);
  }, [socket]);

  const clickTile = (tile) => {
    if(isValidMove(tile) && !info.pawnReady){
      let pawnReadyNow = info.pawnReady;
      // Make sure 1) game has begun, 2) it is their turn, and 3) it's the right player
      if(begun
          && (activeTile.occupied.color === "white") - (whiteToPlay) === 0
          && playerIds[whiteToPlay ? "white" : "black"] === loggedIn._id
      ){

        // build the chess-notation description of the move:
        let moveDescription = "";
        moveDescription += activeTile.occupied.type !== "pawn" ? activeTile.occupied.abbrev :
          tile.occupied? activeTile.file.toLowerCase() : "";
        moveDescription += tile.occupied? "x" : "";
        moveDescription += tile.file.toLowerCase() + tile.rank;

        // make move on front end:
        tile.occupied = activeTile.occupied;
        activeTile.occupied = false;
        setActiveTile(false);
        setAvailableMoves(false);

        const rankIdx = 8 - tile.rank;
        const fileArray = ["A", "B", "C", "D", "E", "F", "G", "H"];
        const fileIdx = fileArray.indexOf(tile.file);
        // Special Case: En Passant
          // facilitate capturing
          if(tile.occupied.type === "pawn" && tile.file === info.enPassantAvailable[0] && tile.rank === info.enPassantAvailable[1]){
            boardStatus[tile.occupied.color === "white" ? 3 : 4][fileIdx].occupied = false;
            moveDescription = `${activeTile.file.toLowerCase()}x`+ moveDescription;
          }
          // update special info if necessary
          let enPassant = false;
          if((tile.occupied.type === "pawn") && ((Math.abs(activeTile.rank - tile.rank)) === 2)){
            enPassant = [tile.file, (tile.rank + activeTile.rank)/2];
          }
        
        // Special Case: Castling
          // facilitate rooks also moving
          if(tile.occupied.type === "king" && Math.abs(fileIdx - fileArray.indexOf(activeTile.file)) === 2){
            if(tile.file === "G"){
              boardStatus[rankIdx][5].occupied = {...boardStatus[rankIdx][7].occupied};
              boardStatus[rankIdx][7].occupied = false;
              moveDescription = "O-O";
            }
            if(tile.file === "C"){
              boardStatus[rankIdx][3].occupied = {...boardStatus[rankIdx][0].occupied};
              boardStatus[rankIdx][0].occupied = false;
              moveDescription = "O-O-O";
            }
          }
          // update special info if necessary
          // rooks:
          let castlingLegalAfterThisMove = {...info.castlingLegal};
          let castleFilesRooks = ["A", "H"], castleRanks = [1, 8];
          for(let file of castleFilesRooks){
            for(let rank of castleRanks){
              if((tile.file === file && tile.rank === rank) || (activeTile.file === file && activeTile.rank === rank)){
                castlingLegalAfterThisMove[`${file}${rank}`] = false;
              }
            }
          }
          // kings:
          if(activeTile.file === "E" && (activeTile.rank === 1 || activeTile.rank === 8)){
            castlingLegalAfterThisMove[`A${activeTile.rank}`] = false;
            castlingLegalAfterThisMove[`E${activeTile.rank}`] = false;
            castlingLegalAfterThisMove[`H${activeTile.rank}`] = false;
          }

        // Special case: pawn promotion
            if(tile.occupied.type === "pawn" && (tile.rank === 1 || tile.rank === 8)){
              pawnReadyNow = tile;
            }

        // Update special info on the front end:
          setInfo({...info,
            castlingLegal: castlingLegalAfterThisMove,
            enPassantAvailable: enPassant,
            pawnReady: pawnReadyNow,
          });

        // add the new move to the move log (which is an array of move pairs):
        const moveLogTemp = [...moveLog];
        if((moveLogTemp.length > 0) && (moveLogTemp[moveLogTemp.length-1].length === 1)){
          moveLogTemp[moveLogTemp.length-1].push(moveDescription);
        } else {
          moveLogTemp.push([moveDescription])
        }
        setMoveLog(moveLogTemp);
        
        // send move to database:
        Axios.put(`http://localhost:8000/api/games/${gameId}`, {boardStatus, whiteToPlay: (pawnReadyNow? whiteToPlay : !whiteToPlay), moveLog: moveLogTemp, $set: {"specialInfo.enPassantAvailable": enPassant, "specialInfo.castlingLegal": castlingLegalAfterThisMove, "specialInfo.pawnReady": pawnReadyNow}}, {withCredentials: true})
            // .then(() => {
            //     if(!pawnReadyNow) setWhiteToPlay(!whiteToPlay);
            //     setThisUserMoves(thisUserMoves + 1);   
            // })
          .catch(err => console.error({errors: err}))
        
        // These lines might eventually get moved into the "then" statement, but for now I'll leave them outside so that front-end-only play will still work.
        if(!pawnReadyNow) setWhiteToPlay(!whiteToPlay);
        setThisUserMoves(thisUserMoves + 1);
      }

      // if it's not this player's turn / piece
      else{
        setActiveTile(false);
        setAvailableMoves(false);
      }
      return;
    }

    if(tile.occupied && !(tile.file === activeTile.file && tile.rank === activeTile.rank)){
      setActiveTile(tile);
      let moves = rules[tile.occupied.type](tile, boardStatus, info);
      removeCheckMoves(moves, tile);
      setAvailableMoves(moves);
    }
    else{
      setActiveTile(false);
      setAvailableMoves(false);
    }
  }

  const isValidMove = tile => {
    for(let i=0; i<availableMoves.length; i++){
      if(availableMoves[i][0] === tile.file && availableMoves[i][1] === tile.rank) return true;
    }
    return false;
  }

  const removeCheckMoves = (moves, tile) => {
    // king moves:
    if(tile.occupied.type === "king"){
      for(let i=0; i<moves.length; i++){
        // prevent kings from moving into check:
        if(piecesAttackingThisSquare(moves[i][0], moves[i][1], tile.occupied.color)){
          moves.splice(i, 1);
          i--;
        }
        // prevent castling through a check:
        else if(tile.file === "E" && (tile.rank === 1 || tile.rank === 8)){
          if(
            (moves[i][0] === "G" && piecesAttackingThisSquare("F", moves[i][1], tile.occupied.color))
            || (moves[i][0] === "C" && piecesAttackingThisSquare("D", moves[i][1], tile.occupied.color))
          ){
            moves.splice(i, 1);
            i--;
          }
        }
      }
    }
    // non-king moves:
  };

  const piecesAttackingThisSquare = (file, rank, color) => {
    for(let i=0; i<boardStatus.length; i++){
      for(let j=0; j<boardStatus[i].length; j++){
        let tile = boardStatus[i][j];
        if(!tile.occupied || tile.occupied.color === color){
          continue;
        }
        let itsMoves = rules[tile.occupied.type](tile, boardStatus, info, true);
        for(let k=0; k<itsMoves.length; k++){
          if(itsMoves[k][0] === file && itsMoves[k][1] === rank){
            return true;
          }
        }
      }
    }
    return false;
  };

  const promotePawn = (tileCopy, choice) => {
    if(playerIds[whiteToPlay ? "white" : "black"] !== loggedIn._id){
      return;
    }
    let boardRow = (tileCopy.rank === 8? 0 : 7);
    let boardStatusTemp = boardStatus;
    for(let i=0; i<boardStatusTemp[boardRow].length; i++){
      if(boardStatusTemp[boardRow][i].file === tileCopy.file){
        boardStatusTemp[boardRow][i].occupied.type = choice;
        console.log(boardStatusTemp[boardRow][i]);
      }
    }
    setBoardStatus(boardStatusTemp);
    let moveLogTemp = [...moveLog];
    moveLogTemp[moveLogTemp.length - 1][whiteToPlay? 0 : 1] += (choice === "knight"? "N" : choice.substring(0, 1).toUpperCase());
    setMoveLog(moveLogTemp);
    setInfo({...info,
        pawnReady: false
    });
    
    Axios.put(`http://localhost:8000/api/games/${gameId}`, {boardStatus: boardStatusTemp, whiteToPlay: !whiteToPlay, moveLog: moveLogTemp, $set: {"specialInfo.pawnReady": false}}, {withCredentials: true})
        // .then(() => {
        //     setWhiteToPlay(!whiteToPlay);
        //     setThisUserMoves(thisUserMoves + 1);
        // })
        .catch(err => console.error({errors: err}))
    
    // See above note -- these lines may eventually get moved into a "then" call but for now I will leave them out of it so front-end-only play works
    setWhiteToPlay(!whiteToPlay);
    setThisUserMoves(thisUserMoves + 1);
  }

  return (
    <div id="board">
      <h3>{whiteToPlay? "White" : "Black"}'s move</h3>

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

      <div className={viewAsBlack? styles.boardContainerBlack : styles.boardContainerWhite}>
        {boardStatus?
          boardStatus.map( (row, i) =>
            <div className={viewAsBlack? styles.tileRowBlack : styles.tileRowWhite} key={i}>
              {row.map( (tile, j) =>
                <div
                  className={`
                    ${styles.tile}
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

      <button className="btn btn-warning my-2"
        onClick = {() => setViewAsBlack(!viewAsBlack)}
      >
        Flip board
      </button>
      
    </div>
  );
}

export default GameBoard;