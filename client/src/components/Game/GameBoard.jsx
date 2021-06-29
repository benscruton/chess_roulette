import {useState, useEffect} from "react";
import Axios from "axios";
import styles from "./GameBoard.module.css";
import images from "./ImageSets/standardChess";
import PawnPromotion from "./PawnPromotion";
const rules = require("./MoveLogic/StandardChess/standardChessMoves");

const GameBoard = ({socket, statusFromParent, gameId, specialInfo, begun, endGame, finished, playerIds, spriteStyle, loggedIn, moveLog, setMoveLog, offerDraw, drawOfferPending}) => {

  const [availableMoves, setAvailableMoves] = useState(false);
  const [boardStatus, setBoardStatus] = useState(statusFromParent);
  const [whiteToPlay, setWhiteToPlay] = useState(true);
  const [activeTile, setActiveTile] = useState(false);
  const [info, setInfo] = useState(specialInfo);
  const [viewAsBlack, setViewAsBlack] = useState(false);
  const [tileStyle, setTileStyle] = useState(styles.tile);
  const [pieceSize, setPieceSize] = useState(styles.piece);

  const fileArray = ["A", "B", "C", "D", "E", "F", "G", "H"];

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
  }, [playerIds]);

  const adjustBoardSize = () => {
    if(window.innerWidth > 600){
      setTileStyle(styles.tile);
      setPieceSize(styles.piece);
    } else if(window.innerWidth > 400){
      setTileStyle(styles.mediumTile);
      setPieceSize(styles.mediumPiece);
    } else {
      setTileStyle(styles.smallTile);
      setPieceSize(styles.smallPiece);
    }
  }

  useEffect( () => {
    adjustBoardSize();
    window.addEventListener("resize", adjustBoardSize);
  }, []);

  // --------------- SOCKET FUNCTIONS: ----------------
  // when a new move comes in, update the board status
  useEffect( () => {
    socket.on("newMoveCameIn", data => {
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
      // Make sure 1) game has begun, 2) it is their turn, and 3) it's the right player
      if(begun && !finished.length && !drawOfferPending
        && (activeTile.occupied.color === "white") - (whiteToPlay) === 0
        && playerIds[whiteToPlay ? "white" : "black"] === loggedIn._id
      ){
        // Get updated board status:
        let params = establishMoveParams(activeTile, tile, info.enPassantAvailable);
        let updatedBoard = JSON.parse(JSON.stringify(boardStatus));
        updatedBoard = executeMove(updatedBoard, activeTile, tile, params);
        
        // Other game info:
        let castlingLegalAfterThisMove = updateCastlingStatus({...info.castlingLegal}, tile, activeTile);
        let pawnReadyNow = info.pawnReady;
        if(activeTile.occupied.type === "pawn" && (tile.rank === 1 || tile.rank === 8)){
          pawnReadyNow = tile;
        }
        let newKingLocations = {...info.kingLocations};
        if(activeTile.occupied.type === "king"){
          newKingLocations[activeTile.occupied.color] = [tile.file, tile.rank];
        }
        let whoseTurnNext = (pawnReadyNow? whiteToPlay : !whiteToPlay);
        params.nextPlayerInCheck = !pawnReadyNow && isInCheck(updatedBoard, whoseTurnNext? "white" : "black");

        let updatedSpecialInfo = {...info,
          castlingLegal: castlingLegalAfterThisMove,
          enPassantAvailable: params.enPassant,
          pawnReady: pawnReadyNow,
          kingLocations: newKingLocations,
          inCheck: params.nextPlayerInCheck
        }

        // Move log with latest move added:
        let moveDescription = buildMoveDescription(activeTile, tile, params);
        let updatedMoveLog = JSON.parse(JSON.stringify(moveLog));
        updatedMoveLog = addLatestMoveToLog(updatedMoveLog, moveDescription);

        // Update all front-end info:
        setBoardStatus(updatedBoard);
        setActiveTile(false);
        setAvailableMoves(false);
        setMoveLog(updatedMoveLog);
        setWhiteToPlay(whoseTurnNext);
        setInfo(updatedSpecialInfo);
        
        // send move to database:
        let databaseInfo = {
          boardStatus: updatedBoard,
          whiteToPlay: whoseTurnNext,
          moveLog: updatedMoveLog,
          $set: {
            "specialInfo.castlingLegal": castlingLegalAfterThisMove,
            "specialInfo.enPassantAvailable": params.enPassant,
            "specialInfo.pawnReady": pawnReadyNow,
            "specialInfo.kingLocations": newKingLocations,
            "specialInfo.inCheck": params.nextPlayerInCheck
          }
        };
        Axios.put(`http://localhost:8000/api/games/${gameId}`, databaseInfo, {withCredentials: true})
          .catch(err => console.error({errors: err}))
        let socketInfo = {
          gameId,
          boardStatus: updatedBoard,
          whiteToPlay: whoseTurnNext,
          info: updatedSpecialInfo,
          moveLog: updatedMoveLog,
        }
        socket.emit("madeAMove", socketInfo);

        let gameFinished = createGameFinishedStatus(updatedBoard, whoseTurnNext, params.nextPlayerInCheck);
        if(!pawnReadyNow && gameFinished.length){
          endGame(gameFinished);
        }
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
      if(tile.occupied.color === (whiteToPlay? "white" : "black")){
        removeCheckMoves(boardStatus, moves, tile);
      }
      setAvailableMoves(moves);
    }
    else{
      setActiveTile(false);
      setAvailableMoves(false);
    }
  }

  const updateCastlingStatus = (castlingLegalAfterThisMove, toTile, fromTile) => {
    // rooks:
    let castleFilesRooks = ["A", "H"], castleRanks = [1, 8];
    for(let file of castleFilesRooks){
      for(let rank of castleRanks){
        if((toTile.file === file && toTile.rank === rank) || (fromTile.file === file && fromTile.rank === rank)){
          castlingLegalAfterThisMove[`${file}${rank}`] = false;
        }
      }
    }
    // kings:
    if(fromTile.file === "E" && castleRanks.includes(fromTile.rank)){
      castlingLegalAfterThisMove[`A${fromTile.rank}`] = false;
      castlingLegalAfterThisMove[`E${fromTile.rank}`] = false;
      castlingLegalAfterThisMove[`H${fromTile.rank}`] = false;
    }
    return castlingLegalAfterThisMove;
  };

  const createGameFinishedStatus = (board, whoseTurnNext, nextPlayerInCheck) => {
    if(playerHasNoLegalMoves(board, whoseTurnNext? "white" : "black")){
      if(nextPlayerInCheck){
        return `Checkmate, ${whoseTurnNext? "Black" : "White"} wins!`;
      } else {
        return "Stalemate, it's a draw!";
      }
    }
    return "";
  };

  const addLatestMoveToLog = (log, moveDescription) => {
    if((log.length > 0) && (log[log.length-1].length === 1)){
      log[log.length-1].push(moveDescription);
    } else {
      log.push([moveDescription])
    }
    return log;
  }

  const establishMoveParams = (fromTile, toTile, enPassantLocation) => {
    let params = {enPassant: false};
      if(toTile.occupied){
        params.captureMove = true;
      }
      if(enPassantLocation
        && fromTile.occupied.type === "pawn"
        && toTile.file === enPassantLocation[0]
        && toTile.rank === enPassantLocation[1]
      ){
        params.enPassantCapture = true;
      }
      if((fromTile.occupied.type === "pawn") && ((Math.abs(fromTile.rank - toTile.rank)) === 2)){
        params.enPassant = [toTile.file, (toTile.rank + fromTile.rank)/2];
      }
      if(fromTile.occupied.type === "king" && Math.abs(fileArray.indexOf(toTile.file) - fileArray.indexOf(fromTile.file)) === 2){
        if(toTile.file === "G"){
          params.castling = "O-O";
        }
        else if(toTile.file === "C"){
          params.castling = "O-O-O";
        }
      }
    return params;
  };

  const buildMoveDescription = (fromTile, toTile, params) => {
    if(params.castling){
      return params.castling;
    }
    let moveDescription = (fromTile.occupied.type === "pawn" ? "" : fromTile.occupied.abbrev);
    if(params.captureMove || params.enPassantCapture){
      moveDescription += (fromTile.occupied.type === "pawn" ? fromTile.file.toLowerCase() : "");
      moveDescription += "x";
    }
    moveDescription += toTile.file.toLowerCase() + toTile.rank;
    if(params.nextPlayerInCheck){
      moveDescription += "+";
    }
    return moveDescription;
  };

  const executeMove = (board, fromTile, toTile, params = {}) => {
    // const fileArray = ["A", "B", "C", "D", "E", "F", "G", "H"];
    // const fromFileIdx = fileArray.indexOf(fromTile.file);
    // const fromRankIdx = 8 - fromTile.rank;
    const toFileIdx = fileArray.indexOf(toTile.file);
    const toRankIdx = 8 - toTile.rank;
    fromTile = board[8 - fromTile.rank][fileArray.indexOf(fromTile.file)];
    toTile = board[toRankIdx][toFileIdx];

    toTile.occupied = fromTile.occupied;
    fromTile.occupied = false;

    if(params.enPassantCapture){
      board[toTile.occupied.color === "white" ? 3 : 4][toFileIdx].occupied = false;
    }
    if(params.castling){
      if(params.castling === "O-O"){
        board[toRankIdx][5].occupied = {...board[toRankIdx][7].occupied};
        board[toRankIdx][7].occupied = false;
      }
      else{
        board[toRankIdx][3].occupied = {...board[toRankIdx][0].occupied};
        board[toRankIdx][0].occupied = false;
      }
    }
    return board;
  }

  const isValidMove = tile => {
    for(let i=0; i<availableMoves.length; i++){
      if(availableMoves[i][0] === tile.file && availableMoves[i][1] === tile.rank) return true;
    }
    return false;
  }

  const isInCheck = (board, color, kingLocations = info.kingLocations) => {
    let kingSpot = kingLocations[color];
    return piecesAttackingThisSquare(board, kingSpot[0], kingSpot[1], color);
  }

  const removeCheckMoves = (origBoard, moves, tile) => {
    for(let i=0; i<moves.length; i++){
      let board = JSON.parse(JSON.stringify(origBoard));
      // const fromFileIdx = fileArray.indexOf(tile.file);
      // const fromRankIdx = 8 - tile.rank;
      // const toFileIdx = fileArray.indexOf(moves[i][0]);
      // const toRankIdx = 8 - moves[i][1];
      const fromTile = board[8 - tile.rank][fileArray.indexOf(tile.file)];
      const toTile = board[8 - moves[i][1]][fileArray.indexOf(moves[i][0])];
      const newKingLocations = JSON.parse(JSON.stringify(info.kingLocations));
      if(tile.occupied.type === "king"){
        newKingLocations[tile.occupied.color] = [moves[i][0], moves[i][1]];
      }
      
      let params = establishMoveParams(fromTile, toTile, info.enPassantAvailable);
      board = executeMove(board, fromTile, toTile, params);
      if(isInCheck(board, tile.occupied.color, newKingLocations)){
        moves.splice(i, 1);
        i--;
      }
    }
  };

  // NOTE: "color" refers to the player BEING ATTACKED at this square.
  // p(file, rank, "black") will determine if any WHITE pieces are attacking the square.
  const piecesAttackingThisSquare = (board, file, rank, color) => {
    for(let i=0; i<board.length; i++){
      for(let j=0; j<board[i].length; j++){
        let tile = board[i][j];
        if(!tile.occupied || tile.occupied.color === color){
          continue;
        }
        let itsMoves = rules[tile.occupied.type](tile, board, info, true);
        for(let k=0; k<itsMoves.length; k++){
          if(itsMoves[k][0] === file && itsMoves[k][1] === rank){
            return true;
          }
        }
      }
    }
    return false;
  };

  const playerHasNoLegalMoves = (board, color) => {
    for(let i=0; i<board.length; i++){
      for(let j=0; j<board[i].length; j++){
        let tile = board[i][j];        
        if(!tile.occupied || tile.occupied.color !== color){
          continue;
        }
        let itsMoves = rules[tile.occupied.type](tile, board, info);
        removeCheckMoves(board, itsMoves, tile);
        if(itsMoves.length) return false;
      }
    }
    return true;
  };

  const promotePawn = (tileCopy, choice) => {
    if(playerIds[whiteToPlay ? "white" : "black"] !== loggedIn._id){
      return;
    }
    let boardRow = (tileCopy.rank === 8? 0 : 7);
    let boardFile = fileArray.indexOf(tileCopy.file);
    let updatedBoard = JSON.parse(JSON.stringify(boardStatus));
    updatedBoard[boardRow][boardFile].occupied.type = choice;

    let nextPlayerInCheck = isInCheck(updatedBoard, (whiteToPlay? "black" : "white"));

    let updatedMoveLog = JSON.parse(JSON.stringify(moveLog));
    updatedMoveLog[updatedMoveLog.length - 1][whiteToPlay? 0 : 1] += (choice === "knight"? "N" : choice.substring(0, 1).toUpperCase() + (nextPlayerInCheck ? "+" : ""));

    let updatedSpecialInfo = {...info,
      pawnReady: false,
      inCheck: nextPlayerInCheck
    };

    setBoardStatus(updatedBoard);
    setMoveLog(updatedMoveLog);
    setInfo(updatedSpecialInfo);

    let databaseInfo = {
      boardStatus: updatedBoard,
      whiteToPlay: !whiteToPlay,
      moveLog: updatedMoveLog,
      $set: {
        "specialInfo.pawnReady": false,
        "specialInfo.inCheck": nextPlayerInCheck
      }
    }
    Axios.put(`http://localhost:8000/api/games/${gameId}`, databaseInfo, {withCredentials: true})
        .catch(err => console.error({errors: err}))
    
    let socketInfo = {
      gameId,
      boardStatus: updatedBoard,
      whiteToPlay: !whiteToPlay,
      info: updatedSpecialInfo,
      moveLog: updatedMoveLog,
    }
    socket.emit("madeAMove", socketInfo);

    let gameFinished = createGameFinishedStatus(updatedBoard, !whiteToPlay, nextPlayerInCheck);
    console.log(gameFinished);
    if(gameFinished.length){
      endGame(gameFinished);
    }

    setWhiteToPlay(!whiteToPlay);
  };

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
  };

  return (
    <div id="board">
      <h3>
        {finished.length?
          finished
          :
          `${whiteToPlay? "White" : "Black"}${info.inCheck? " is in check" : "'s move"}`}
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

      <div className={viewAsBlack? styles.boardContainerBlack : styles.boardContainerWhite}>
        {boardStatus?
          boardStatus.map( (row, i) =>
            <div className={viewAsBlack? styles.tileRowBlack : styles.tileRowWhite} key={i}>
              {row.map( (tile, j) =>
                <div
                  className={`
                    ${tileStyle}
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
                      className={pieceSize}
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

      <button
        className="btn btn-info my-2 mx-1"
        onClick = {() => setViewAsBlack(!viewAsBlack)}
      >
        Flip board
      </button>

      {!finished.length && (playerIds.white === loggedIn._id || playerIds.black === loggedIn._id)?
        <>
          <button
            className="btn btn-warning my-2 mx-1"
            onClick={offerDraw}
          >
            Offer draw
          </button>
          
          <button
            className="btn btn-danger my-2 mx-1"
            onClick = {resign}
          >
            Resign
          </button>
        </>
        :
        <></>
      }
      
    </div>
  );
}

export default GameBoard;