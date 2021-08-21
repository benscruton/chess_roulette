// const clickTile = (tile) => {
//   if(isValidMove(tile) && !info.pawnReady){
//     // Make sure 1) game has begun, 2) it is their turn, and 3) it's the right player
//     if(begun && !finished.length && !drawOfferPending
//       && (activeTile.occupied.color === "white") - (whiteToPlay) === 0
//       && playerIds[whiteToPlay ? "white" : "black"] === loggedIn._id
//     ){
//       // Get updated board status:
//       let params = establishMoveParams(activeTile, tile, info.enPassantAvailable);
//       let updatedBoard = JSON.parse(JSON.stringify(boardStatus));
//       updatedBoard = executeMove(updatedBoard, activeTile, tile, params);
      
//       // Other game info:
//       let castlingLegalAfterThisMove = updateCastlingStatus({...info.castlingLegal}, tile, activeTile);
//       let pawnReadyNow = info.pawnReady;
//       if(activeTile.occupied.type === "pawn" && (tile.rank === 1 || tile.rank === 8)){
//         pawnReadyNow = tile;
//       }
//       let newKingLocations = {...info.kingLocations};
//       if(activeTile.occupied.type === "king"){
//         newKingLocations[activeTile.occupied.color] = [tile.file, tile.rank];
//       }
//       let whoseTurnNext = (pawnReadyNow? whiteToPlay : !whiteToPlay);
//       params.nextPlayerInCheck = !pawnReadyNow && isInCheck(updatedBoard, whoseTurnNext? "white" : "black");

//       let updatedSpecialInfo = {...info,
//         castlingLegal: castlingLegalAfterThisMove,
//         enPassantAvailable: params.enPassant,
//         pawnReady: pawnReadyNow,
//         kingLocations: newKingLocations,
//         inCheck: params.nextPlayerInCheck
//       }

//       // Move log with latest move added:
//       let moveDescription = buildMoveDescription(activeTile, tile, params);
//       let updatedMoveLog = JSON.parse(JSON.stringify(moveLog));
//       updatedMoveLog = addLatestMoveToLog(updatedMoveLog, moveDescription);

//       // Update all front-end info:
//       setBoardStatus(updatedBoard);
//       setActiveTile(false);
//       setAvailableMoves(false);
//       setMoveLog(updatedMoveLog);
//       setWhiteToPlay(whoseTurnNext);
//       setInfo(updatedSpecialInfo);
      
//       // send move to database:
//       let databaseInfo = {
//         boardStatus: updatedBoard,
//         whiteToPlay: whoseTurnNext,
//         moveLog: updatedMoveLog,
//         $set: {
//           "specialInfo.castlingLegal": castlingLegalAfterThisMove,
//           "specialInfo.enPassantAvailable": params.enPassant,
//           "specialInfo.pawnReady": pawnReadyNow,
//           "specialInfo.kingLocations": newKingLocations,
//           "specialInfo.inCheck": params.nextPlayerInCheck
//         }
//       };
//       Axios.put(`http://localhost:8000/api/games/${gameId}`, databaseInfo, {withCredentials: true})
//         .catch(err => console.error({errors: err}))
//       let socketInfo = {
//         gameId,
//         boardStatus: updatedBoard,
//         whiteToPlay: whoseTurnNext,
//         info: updatedSpecialInfo,
//         moveLog: updatedMoveLog,
//       }
//       socket.emit("madeAMove", socketInfo);

//       let gameFinished = createGameFinishedStatus(updatedBoard, whoseTurnNext, params.nextPlayerInCheck);
//       if(!pawnReadyNow && gameFinished.length){
//         endGame(gameFinished);
//       }
//     }

//     // if it's not this player's turn / piece
//     else{
//       setActiveTile(false);
//       setAvailableMoves(false);
//     }
//     return;
//   }

//   if(tile.occupied && !(tile.file === activeTile.file && tile.rank === activeTile.rank)){
//     setActiveTile(tile);
//     let moves = moveLogic[tile.occupied.type](tile, boardStatus, info);
//     removeCheckMoves(boardStatus, moves, tile);
//     setAvailableMoves(moves);
//   }
//   else{
//     setActiveTile(false);
//     setAvailableMoves(false);
//   }
// };

// const updateCastlingStatus = (castlingLegalAfterThisMove, toTile, fromTile) => {
//   // rooks:
//   let castleFilesRooks = ["A", "H"], castleRanks = [1, 8];
//   for(let file of castleFilesRooks){
//     for(let rank of castleRanks){
//       if((toTile.file === file && toTile.rank === rank) || (fromTile.file === file && fromTile.rank === rank)){
//         castlingLegalAfterThisMove[`${file}${rank}`] = false;
//       }
//     }
//   }
//   // kings:
//   if(fromTile.file === "E" && castleRanks.includes(fromTile.rank)){
//     castlingLegalAfterThisMove[`A${fromTile.rank}`] = false;
//     castlingLegalAfterThisMove[`E${fromTile.rank}`] = false;
//     castlingLegalAfterThisMove[`H${fromTile.rank}`] = false;
//   }
//   return castlingLegalAfterThisMove;
// };

// const establishMoveParams = (fromTile, toTile, enPassantLocation) => {
//   let params = {enPassant: false};
//     if(toTile.occupied){
//       params.captureMove = true;
//     }
//     if(enPassantLocation
//       && fromTile.occupied.type === "pawn"
//       && toTile.file === enPassantLocation[0]
//       && toTile.rank === enPassantLocation[1]
//     ){
//       params.enPassantCapture = true;
//     }
//     if((fromTile.occupied.type === "pawn") && ((Math.abs(fromTile.rank - toTile.rank)) === 2)){
//       params.enPassant = [toTile.file, (toTile.rank + fromTile.rank)/2];
//     }
//     if(fromTile.occupied.type === "king" && Math.abs(fileArray.indexOf(toTile.file) - fileArray.indexOf(fromTile.file)) === 2){
//       if(toTile.file === "G"){
//         params.castling = "O-O";
//       }
//       else if(toTile.file === "C"){
//         params.castling = "O-O-O";
//       }
//     }
//   return params;
// };

// const isValidMove = tile => {
//   for(let i=0; i<availableMoves.length; i++){
//     if(availableMoves[i][0] === tile.file && availableMoves[i][1] === tile.rank) return true;
//   }
//   return false;
// };

// const isInCheck = (board, color, kingLocations = info.kingLocations) => {
//   let kingSpot = kingLocations[color];
//   return piecesAttackingThisSquare(board, kingSpot[0], kingSpot[1], color);
// };

// // NOTE: "color" refers to the player BEING ATTACKED at this square.
// // p(file, rank, "black") will determine if any WHITE pieces are attacking the square.
// const piecesAttackingThisSquare = (board, file, rank, color) => {
//   for(let i=0; i<board.length; i++){
//     for(let j=0; j<board[i].length; j++){
//       let tile = board[i][j];
//       if(!tile.occupied || tile.occupied.color === color){
//         continue;
//       }
//       let itsMoves = moveLogic[tile.occupied.type](tile, board, info, true);
//       for(let k=0; k<itsMoves.length; k++){
//         if(itsMoves[k][0] === file && itsMoves[k][1] === rank){
//           return true;
//         }
//       }
//     }
//   }
//   return false;
// };

// const removeCheckMoves = (origBoard, moves, tile) => {
//   for(let i=0; i<moves.length; i++){
//     let board = JSON.parse(JSON.stringify(origBoard));
//     const fromTile = board[8 - tile.rank][fileArray.indexOf(tile.file)];
//     const toTile = board[8 - moves[i][1]][fileArray.indexOf(moves[i][0])];
//     const newKingLocations = JSON.parse(JSON.stringify(info.kingLocations));
//     if(tile.occupied.type === "king"){
//       newKingLocations[tile.occupied.color] = [moves[i][0], moves[i][1]];
//     }
    
//     let params = establishMoveParams(fromTile, toTile, info.enPassantAvailable);
//     board = executeMove(board, fromTile, toTile, params);
//     if(isInCheck(board, tile.occupied.color, newKingLocations)){
//       moves.splice(i, 1);
//       i--;
//       continue;
//     }

//     // prevent castling through a check
//     if(tile.occupied.type === "king" && tile.file === "E"
//       && (moves[i][0] === "C" || moves[i][0] === "G")
//     ){
//       let checkFile = (moves[i][0] === "C" ? "D" : "F");
//       if(piecesAttackingThisSquare(origBoard, checkFile, tile.rank, tile.occupied.color)){
//         moves.splice(i, 1);
//         i--;
//       }
//     }
//   }
// };

// const executeMove = (board, fromTile, toTile, params = {}) => {
//   const toFileIdx = fileArray.indexOf(toTile.file);
//   const toRankIdx = 8 - toTile.rank;
//   fromTile = board[8 - fromTile.rank][fileArray.indexOf(fromTile.file)];
//   toTile = board[toRankIdx][toFileIdx];

//   toTile.occupied = fromTile.occupied;
//   fromTile.occupied = false;

//   if(params.enPassantCapture){
//     board[toTile.occupied.color === "white" ? 3 : 4][toFileIdx].occupied = false;
//   }
//   if(params.castling){
//     if(params.castling === "O-O"){
//       board[toRankIdx][5].occupied = {...board[toRankIdx][7].occupied};
//       board[toRankIdx][7].occupied = false;
//     }
//     else{
//       board[toRankIdx][3].occupied = {...board[toRankIdx][0].occupied};
//       board[toRankIdx][0].occupied = false;
//     }
//   }
//   return board;
// };

// const playerHasNoLegalMoves = (board, color) => {
//   for(let i=0; i<board.length; i++){
//     for(let j=0; j<board[i].length; j++){
//       let tile = board[i][j];        
//       if(!tile.occupied || tile.occupied.color !== color){
//         continue;
//       }
//       let itsMoves = moveLogic[tile.occupied.type](tile, board, info);
//       removeCheckMoves(board, itsMoves, tile);
//       if(itsMoves.length) return false;
//     }
//   }
//   return true;
// };

// const promotePawn = (tileCopy, choice) => {
//   if(playerIds[whiteToPlay ? "white" : "black"] !== loggedIn._id){
//     return;
//   }
//   let boardRow = (tileCopy.rank === 8? 0 : 7);
//   let boardFile = fileArray.indexOf(tileCopy.file);
//   let updatedBoard = JSON.parse(JSON.stringify(boardStatus));
//   let abbrev = (choice === "knight"? "N" : choice.substring(0, 1).toUpperCase());
//   updatedBoard[boardRow][boardFile].occupied.type = choice;
//   updatedBoard[boardRow][boardFile].occupied.abbrev = abbrev;

//   let nextPlayerInCheck = isInCheck(updatedBoard, (whiteToPlay? "black" : "white"));

//   let updatedMoveLog = JSON.parse(JSON.stringify(moveLog));
//   updatedMoveLog[updatedMoveLog.length - 1][whiteToPlay? 0 : 1] += (abbrev + (nextPlayerInCheck ? "+" : ""));

//   let updatedSpecialInfo = {...info,
//     pawnReady: false,
//     inCheck: nextPlayerInCheck
//   };

//   setBoardStatus(updatedBoard);
//   setMoveLog(updatedMoveLog);
//   setInfo(updatedSpecialInfo);

//   let databaseInfo = {
//     boardStatus: updatedBoard,
//     whiteToPlay: !whiteToPlay,
//     moveLog: updatedMoveLog,
//     $set: {
//       "specialInfo.pawnReady": false,
//       "specialInfo.inCheck": nextPlayerInCheck
//     }
//   }
//   Axios.put(`http://localhost:8000/api/games/${gameId}`, databaseInfo, {withCredentials: true})
//       .catch(err => console.error({errors: err}))
  
//   let socketInfo = {
//     gameId,
//     boardStatus: updatedBoard,
//     whiteToPlay: !whiteToPlay,
//     info: updatedSpecialInfo,
//     moveLog: updatedMoveLog,
//   }
//   socket.emit("madeAMove", socketInfo);

//   let gameFinished = createGameFinishedStatus(updatedBoard, !whiteToPlay, nextPlayerInCheck);
//   console.log(gameFinished);
//   if(gameFinished.length){
//     endGame(gameFinished);
//   }

//   setWhiteToPlay(!whiteToPlay);
// };

// const test = (testState, setTestState) => {
//   console.log("hello");
// }

module.exports = {
  add : (testState, setTestState) => 
  setTestState(testState + 1),

  subtract: (testState, setTestState) => setTestState(testState - 1)

  
}