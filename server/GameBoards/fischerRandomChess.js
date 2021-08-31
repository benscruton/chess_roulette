function createBoard(){
  const startingBoard = [];
  const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
  for(let i=8; i>=1; i--){
      const newRow = [];
      for(let j=0; j<8; j++){
          newRow.push({
              rank: i,
              file: letters[j],
              occupied: false
          });
      }
      startingBoard.push(newRow);
  }

  const remainingOptions = [0, 1, 2, 3, 4, 5, 6, 7];
  const bishop1 = Math.floor(4 * Math.random()) * 2;
  remainingOptions.splice(remainingOptions.indexOf(bishop1), 1);
  const bishop2 = Math.floor(4 * Math.random()) * 2 + 1;
  remainingOptions.splice(remainingOptions.indexOf(bishop2), 1);
  const queen = remainingOptions[Math.floor(6 * Math.random())];
  remainingOptions.splice(remainingOptions.indexOf(queen), 1);
  const knight1 = remainingOptions[Math.floor(5 * Math.random())];
  remainingOptions.splice(remainingOptions.indexOf(knight1), 1);
  const knight2 = remainingOptions[Math.floor(4 * Math.random())];
  remainingOptions.splice(remainingOptions.indexOf(knight2), 1);
  const [rook1, king, rook2] = remainingOptions;

  const pieceArrangement = [];
  pieceArrangement[bishop1] = {type: "bishop", abbrev: "B"};
  pieceArrangement[bishop2] = {type: "bishop", abbrev: "B"};
  pieceArrangement[knight1] = {type: "knight", abbrev: "N"};
  pieceArrangement[knight2] = {type: "knight", abbrev: "N"};
  pieceArrangement[rook1] = {type: "rook", abbrev: "R"};
  pieceArrangement[rook2] = {type: "rook", abbrev: "R"};
  pieceArrangement[queen] = {type: "queen", abbrev: "Q"};
  pieceArrangement[king] = {type: "king", abbrev: "K"};

  for(let i=0; i<pieceArrangement.length; i++){
    startingBoard[0][i].occupied = {...pieceArrangement[i], color: "black"};
    startingBoard[1][i].occupied = {type: "pawn", abbrev: "P", color: "black"};
    startingBoard[6][i].occupied = {type: "pawn", abbrev: "P", color: "white"};
    startingBoard[7][i].occupied = {...pieceArrangement[i], color: "white"};
  }

  return startingBoard;
}

module.exports = createBoard;