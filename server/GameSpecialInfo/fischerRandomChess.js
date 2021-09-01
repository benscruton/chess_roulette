const generateSpecialInfo = board => {
  const specialInfo = {};

  const kingFile = findKingFile(board);
  const [rook1File, rook2File] = findRookFiles(board);
  specialInfo.startingFiles = {kingFile, rook1File, rook2File};
  
  specialInfo.kingLocations = {
    white: [kingFile, 1],
    black: [kingFile, 8]
  };

  specialInfo.isChecked = {
    white: false,
    black: false
  };

  specialInfo.enPassantAvailable = false;

  specialInfo.castlingLegal = {
    [`${rook1File}1`]: true,
    [`${kingFile}1`]: true,
    [`${rook2File}1`]: true,
    [`${rook1File}8`]: true,
    [`${kingFile}8`]: true,
    [`${rook2File}8`]: true
  };

  specialInfo.pawnReady = false;

  specialInfo.inCheck = false;

  return specialInfo;
}

const findKingFile = board => {
  const backRow = board[0];
  const kingTile = backRow.filter(square => square.occupied.type === "king")[0];
  return kingTile.file;
};

const findRookFiles = board => {
  const backRow = board[0];
  const rookTiles = backRow.filter(square => square.occupied.type === "rook");
  return rookTiles.map(tile => tile.file);
}

module.exports = generateSpecialInfo;