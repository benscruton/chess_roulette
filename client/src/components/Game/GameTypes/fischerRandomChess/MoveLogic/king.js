const checkMoves =  (tile, boardStatus, specialInfo, onlyCheckingAttackingSquares = false) => {
  const rankIdx = 8 - tile.rank;
  const fileArray = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const fileIdx = fileArray.indexOf(tile.file);
  const piece = tile.occupied;

  const moves = [];

  let i=1;
  if(rankIdx - i >= 0
    && (boardStatus[rankIdx-i][fileIdx].occupied.color !== piece.color || onlyCheckingAttackingSquares)
  ){
    moves.push([tile.file, tile.rank + i]);
  }

  if(rankIdx + i < 8
    && (boardStatus[rankIdx+i][fileIdx].occupied.color !== piece.color || onlyCheckingAttackingSquares)
  ){
    moves.push([tile.file, tile.rank - i]);
  }

  if(fileIdx - i >= 0
    && (boardStatus[rankIdx][fileIdx-i].occupied.color !== piece.color || onlyCheckingAttackingSquares)
  ){
    moves.push([fileArray[fileIdx-i], tile.rank]);
  }

  if(fileIdx + i < 8
    && (boardStatus[rankIdx][fileIdx+i].occupied.color !== piece.color || onlyCheckingAttackingSquares)
  ){
    moves.push([fileArray[fileIdx+i], tile.rank]);
  }

  if(rankIdx + i < 8 && fileIdx + i < 8
    && (boardStatus[rankIdx+i][fileIdx+i].occupied.color !== piece.color || onlyCheckingAttackingSquares)
  ){
    moves.push([fileArray[fileIdx+i], tile.rank - i]);
  }

  if(rankIdx - i >= 0 && fileIdx + i < 8
    && (boardStatus[rankIdx-i][fileIdx+i].occupied.color !== piece.color || onlyCheckingAttackingSquares)
  ){
    moves.push([fileArray[fileIdx+i], tile.rank + i]);
  }

  if(rankIdx - i >= 0 && fileIdx - i >= 0
    && (boardStatus[rankIdx-i][fileIdx-i].occupied.color !== piece.color || onlyCheckingAttackingSquares)
  ){
    moves.push([fileArray[fileIdx-i], tile.rank + i]);
  }

  if(rankIdx + i < 8 && fileIdx - i >= 0
    && (boardStatus[rankIdx+i][fileIdx-i].occupied.color !== piece.color || onlyCheckingAttackingSquares)
  ){
    moves.push([fileArray[fileIdx-i], tile.rank - i]);
  }

  // Castling:
  const {kingFile, rook1File, rook2File} = specialInfo.startingFiles;








  // if(!onlyCheckingAttackingSquares && specialInfo.castlingLegal.hasOwnProperty(`${tile.file}${tile.rank}`) && specialInfo.castlingLegal[`${tile.file}${tile.rank}`] && !specialInfo.inCheck){
  //   // check king-side:
  //   if(specialInfo.castlingLegal[`H${tile.rank}`] 
  //   && !boardStatus[rankIdx][5].occupied
  //   && !boardStatus[rankIdx][6].occupied
  //   ){
  //     moves.push(["G", tile.rank]);
  //   }
  //   //check queen-side:
  //   if(specialInfo.castlingLegal[`A${tile.rank}`] 
  //   && !boardStatus[rankIdx][3].occupied
  //   && !boardStatus[rankIdx][2].occupied
  //   && !boardStatus[rankIdx][1].occupied
  //   ){
  //     moves.push(["C", tile.rank]);
  //   }
  // }


  return moves;
}

module.exports = checkMoves;