const checkMoves =  (tile, boardStatus, specialInfo, onlyCheckingAttackingSquares = false) => {
  const rankIdx = 8 - tile.rank;
  const fileArray = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const fileIdx = fileArray.indexOf(tile.file);
  const piece = tile.occupied;

  const moves = [];

  let i=1;
  while(rankIdx - i >= 0 && !boardStatus[rankIdx-i][fileIdx].occupied){
    moves.push([tile.file, tile.rank + i]);
    i++;
  }
  if(rankIdx - i >= 0){
    if(boardStatus[rankIdx-i][fileIdx].occupied.color !== piece.color || onlyCheckingAttackingSquares){
      moves.push([tile.file, tile.rank + i]);
    }
  }

  i=1;
  while(rankIdx + i < 8 && !boardStatus[rankIdx+i][fileIdx].occupied){
    moves.push([tile.file, tile.rank - i]);
    i++;
  }
  if(rankIdx + i < 8){
    if(boardStatus[rankIdx+i][fileIdx].occupied.color !== piece.color || onlyCheckingAttackingSquares){
      moves.push([tile.file, tile.rank - i]);
    }
  }

  i=1;
  while(fileIdx - i >= 0 && !boardStatus[rankIdx][fileIdx-i].occupied){
    moves.push([fileArray[fileIdx-i], tile.rank]);
    i++;
  }
  if(fileIdx - i >= 0){
    if(boardStatus[rankIdx][fileIdx-i].occupied.color !== piece.color || onlyCheckingAttackingSquares){
      moves.push([fileArray[fileIdx-i], tile.rank]);
    }
  }

  i=1;
  while(fileIdx + i < 8 && !boardStatus[rankIdx][fileIdx+i].occupied){
    moves.push([fileArray[fileIdx+i], tile.rank]);
    i++;
  }
  if(fileIdx + i < 8){
    if(boardStatus[rankIdx][fileIdx+i].occupied.color !== piece.color || onlyCheckingAttackingSquares){
      moves.push([fileArray[fileIdx+i], tile.rank]);
    }
  }

  return moves;
}

module.exports = checkMoves;