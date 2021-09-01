const checkMoves =  (tile, boardStatus, specialInfo, onlyCheckingAttackingSquares = false) => {
  const rankIdx = 8 - tile.rank;
  const fileArray = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const fileIdx = fileArray.indexOf(tile.file);
  const piece = tile.occupied;

  const moves = [];

  if(rankIdx + 2 < 8 && fileIdx + 1 < 8
    && (boardStatus[rankIdx+2][fileIdx+1].occupied.color !== piece.color || onlyCheckingAttackingSquares)
  ){
    moves.push([fileArray[fileIdx+1], tile.rank - 2]);
  }

  if(rankIdx + 1 < 8 && fileIdx + 2 < 8
    && (boardStatus[rankIdx+1][fileIdx+2].occupied.color !== piece.color || onlyCheckingAttackingSquares)
  ){
    moves.push([fileArray[fileIdx+2], tile.rank - 1]);
  }

  if(rankIdx - 2 >= 0 && fileIdx + 1 < 8
    && (boardStatus[rankIdx-2][fileIdx+1].occupied.color !== piece.color || onlyCheckingAttackingSquares)
  ){
    moves.push([fileArray[fileIdx+1], tile.rank + 2]);
  }

  if(rankIdx - 1 >= 0 && fileIdx + 2 < 8
    && (boardStatus[rankIdx-1][fileIdx+2].occupied.color !== piece.color || onlyCheckingAttackingSquares)
  ){
    moves.push([fileArray[fileIdx+2], tile.rank + 1]);
  }

  if(rankIdx - 2 >= 0 && fileIdx - 1 >= 0
    && (boardStatus[rankIdx-2][fileIdx-1].occupied.color !== piece.color || onlyCheckingAttackingSquares)
  ){
    moves.push([fileArray[fileIdx-1], tile.rank + 2]);
  }

  if(rankIdx - 1 >= 0 && fileIdx - 2 >= 0
    && (boardStatus[rankIdx-1][fileIdx-2].occupied.color !== piece.color || onlyCheckingAttackingSquares)
  ){
    moves.push([fileArray[fileIdx-2], tile.rank + 1]);
  }

  if(rankIdx + 2 < 8 && fileIdx - 1 >= 0
    && (boardStatus[rankIdx+2][fileIdx-1].occupied.color !== piece.color || onlyCheckingAttackingSquares)
  ){
    moves.push([fileArray[fileIdx-1], tile.rank - 2]);
  }

  if(rankIdx + 1 < 8 && fileIdx - 2 >= 0
    && (boardStatus[rankIdx+1][fileIdx-2].occupied.color !== piece.color || onlyCheckingAttackingSquares)
  ){
    moves.push([fileArray[fileIdx-2], tile.rank - 1]);
  }


  return moves;
}

export default checkMoves;