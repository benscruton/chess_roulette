const createBoard = () => {
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

    const pieceArrangement = [
        {type: "rook", abbrev: "R"},
        {type: "knight", abbrev: "N"},
        {type: "bishop", abbrev: "B"},
        {type: "queen", abbrev: "Q"},
        {type: "king", abbrev: "K"},
        {type: "bishop", abbrev: "B"},
        {type: "knight", abbrev: "N"},
        {type: "rook", abbrev: "R"},
    ];

    for(let i=0; i<8; i++){
        startingBoard[0][i].occupied = {...pieceArrangement[i], color: "black"};
        startingBoard[1][i].occupied = {type: "pawn", abbrev: "P", color: "black"};
        startingBoard[6][i].occupied = {type: "pawn", abbrev: "P", color: "white"};
        startingBoard[7][i].occupied = {...pieceArrangement[i], color: "white"};
    }

    return startingBoard;
}

module.exports = createBoard;