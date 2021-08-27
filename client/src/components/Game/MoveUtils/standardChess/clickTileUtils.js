const fileArray = ["A", "B", "C", "D", "E", "F", "G", "H"];
const moveLogic = require("./MoveLogic");

const doMove = (tile, additionalData) => {
  const {
    activeTile,
    boardStatus,
    info,
    moveLog,
    whiteToPlay
  } = additionalData;

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
  params.nextPlayerInCheck = !pawnReadyNow && isInCheck(updatedBoard, info, whoseTurnNext? "white" : "black", newKingLocations);
  
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

  // Check if this move ends the game:
  let gameFinished = createGameFinishedStatus(updatedBoard, updatedSpecialInfo, whoseTurnNext, params.nextPlayerInCheck);

  // Package info to return to GameBoard:
  const results = {
    boardStatus: updatedBoard,
    moveLog: updatedMoveLog,
    whiteToPlay: whoseTurnNext,
    info: updatedSpecialInfo,
    gameFinished
  };

  return results;
}



const getMoves = (tile, additionalData) => {
  const {
    boardStatus,
    info
  } = additionalData;

  let moves = moveLogic[tile.occupied.type](tile, boardStatus, info);
  moves = removeCheckMoves(boardStatus, info, moves, tile);
  return moves;

};









const promotePawn = (tile, choice, additionalData) => {
  // if(playerIds[whiteToPlay ? "white" : "black"] !== loggedIn._id){
  //   return;
  // }

  const {
    boardStatus,
    info,
    moveLog,
    whiteToPlay
  } = additionalData;

  let boardRow = (tile.rank === 8? 0 : 7);
  let boardFile = fileArray.indexOf(tile.file);
  let updatedBoard = JSON.parse(JSON.stringify(boardStatus));
  updatedBoard[boardRow][boardFile].occupied = choice;

  let nextPlayerInCheck = isInCheck(updatedBoard, info, (whiteToPlay? "black" : "white"), info.kingLocations);

  let updatedMoveLog = JSON.parse(JSON.stringify(moveLog));
  updatedMoveLog[updatedMoveLog.length - 1][whiteToPlay? 0 : 1] += (choice.abbrev + (nextPlayerInCheck ? "+" : ""));

  let updatedSpecialInfo = {...info,
    pawnReady: false,
    inCheck: nextPlayerInCheck
  };

  let gameFinished = createGameFinishedStatus(updatedBoard, updatedSpecialInfo, !whiteToPlay, nextPlayerInCheck);
  
  // Package info to return to GameBoard:
  const results = {
    updatedBoard,
    updatedMoveLog,
    updatedWhiteToPlay: !whiteToPlay,
    updatedSpecialInfo,
    gameFinished
  };

  return results;




  // setBoardStatus(updatedBoard);
  // setMoveLog(updatedMoveLog);
  // setInfo(updatedSpecialInfo);

  // let databaseInfo = {
  //   boardStatus: updatedBoard,
  //   whiteToPlay: !whiteToPlay,
  //   moveLog: updatedMoveLog,
  //   $set: {
  //     "specialInfo.pawnReady": false,
  //     "specialInfo.inCheck": nextPlayerInCheck
  //   }
  // }
  // Axios.put(`http://localhost:8000/api/games/${gameId}`, databaseInfo, {withCredentials: true})
  //     .catch(err => console.error({errors: err}))
  
  // let socketInfo = {
  //   gameId,
  //   boardStatus: updatedBoard,
  //   whiteToPlay: !whiteToPlay,
  //   info: updatedSpecialInfo,
  //   moveLog: updatedMoveLog,
  // }
  // socket.emit("madeAMove", socketInfo);

  // let gameFinished = createGameFinishedStatus(updatedBoard, !whiteToPlay, nextPlayerInCheck);
  // console.log(gameFinished);
  // if(gameFinished.length){
  //   endGame(gameFinished);
  // }

  // setWhiteToPlay(!whiteToPlay);
};















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


const isInCheck = (board, info, color, kingLocations) => {
  let kingSpot = kingLocations[color];
  return piecesAttackingThisSquare(board, info, kingSpot[0], kingSpot[1], color);
};

// NOTE: "color" refers to the player BEING ATTACKED at this square.
// p(file, rank, "black") will determine if any WHITE pieces are attacking the square.
const piecesAttackingThisSquare = (board, info, file, rank, color) => {
  for(let i=0; i<board.length; i++){
    for(let j=0; j<board[i].length; j++){
      let tile = board[i][j];
      if(!tile.occupied || tile.occupied.color === color){
        continue;
      }
      let itsMoves = moveLogic[tile.occupied.type](tile, board, info, true);
      for(let k=0; k<itsMoves.length; k++){
        if(itsMoves[k][0] === file && itsMoves[k][1] === rank){
          return true;
        }
      }
    }
  }
  return false;
};

const removeCheckMoves = (origBoard, info, moves, tile) => {
  const fromTile = origBoard[8 - tile.rank][fileArray.indexOf(tile.file)];
  for(let i=0; i<moves.length; i++){
    let board = JSON.parse(JSON.stringify(origBoard));
    const toTile = board[8 - moves[i][1]][fileArray.indexOf(moves[i][0])];
    const newKingLocations = JSON.parse(JSON.stringify(info.kingLocations));
    if(tile.occupied.type === "king"){
      newKingLocations[tile.occupied.color] = [moves[i][0], moves[i][1]];
    }
    
    let params = establishMoveParams(fromTile, toTile, info.enPassantAvailable);
    board = executeMove(board, fromTile, toTile, params);
    if(isInCheck(board, info, tile.occupied.color, newKingLocations)){
      moves.splice(i, 1);
      i--;
      continue;
    }

    // prevent castling through a check
    if(tile.occupied.type === "king" && tile.file === "E"
      && (moves[i][0] === "C" || moves[i][0] === "G")
    ){
      let checkFile = (moves[i][0] === "C" ? "D" : "F");
      if(piecesAttackingThisSquare(origBoard, info, checkFile, tile.rank, tile.occupied.color)){
        moves.splice(i, 1);
        i--;
      }
    }
  }

  return moves;
};

const executeMove = (board, fromTile, toTile, params = {}) => {
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
};

const playerHasNoLegalMoves = (board, info, color) => {
  for(let i=0; i<board.length; i++){
    for(let j=0; j<board[i].length; j++){
      let tile = board[i][j];        
      if(!tile.occupied || tile.occupied.color !== color){
        continue;
      }
      let itsMoves = moveLogic[tile.occupied.type](tile, board, info);
      removeCheckMoves(board, info, itsMoves, tile);
      if(itsMoves.length) return false;
    }
  }
  return true;
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

const addLatestMoveToLog = (log, moveDescription) => {
  if((log.length > 0) && (log[log.length-1].length === 1)){
    log[log.length-1].push(moveDescription);
  } else {
    log.push([moveDescription])
  }
  return log;
};

// ---------- ENDING GAMES ----------
const createGameFinishedStatus = (board, info, whoseTurnNext, nextPlayerInCheck) => {
  if(playerHasNoLegalMoves(board, info, whoseTurnNext? "white" : "black")){
    if(nextPlayerInCheck){
      return `Checkmate, ${whoseTurnNext? "Black" : "White"} wins!`;
    } else {
      return "Stalemate, it's a draw!";
    }
  }
  return "";
};


module.exports = {
  doMove,
  getMoves,
  promotePawn
};