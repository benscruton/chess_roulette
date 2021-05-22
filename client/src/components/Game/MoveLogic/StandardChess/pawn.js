// Pawns list of legal moves



const checkMoves =  (tile, boardStatus, specialInfo) => {
    const rankIdx = 8 - tile.rank;
    const fileArray = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const fileIdx = fileArray.indexOf(tile.file);
    const piece = tile.occupied;

    const moves = [];

    // prevent crashing if a pawn is clicked on while awaiting promotion
    if(tile.rank === 1 || tile.rank === 8) return moves;
    
    // White pawns: normal moves
    if(piece.color === "white"){
        if(rankIdx > 0 && !boardStatus[rankIdx-1][fileIdx].occupied){
            moves.push([tile.file, tile.rank + 1])
        }
        if(tile.rank === 2){ // Let white pawns move 2 on first move:
            if(!(boardStatus[rankIdx-2][fileIdx].occupied || boardStatus[rankIdx-1][fileIdx].occupied)) moves.push([tile.file, 4]);
        }

        // Capturing
        if(fileIdx > 0 && rankIdx > 0 
            && ((boardStatus[rankIdx-1][fileIdx-1].occupied
              && boardStatus[rankIdx-1][fileIdx-1].occupied.color !== piece.color)
            || (fileArray[fileIdx-1] === specialInfo.enPassantAvailable[0]
              && tile.rank + 1 === specialInfo.enPassantAvailable[1]))
            ){
                moves.push([fileArray[fileIdx - 1], tile.rank + 1]);
            }
        if(fileIdx < 7 && rankIdx > 0
            && ((boardStatus[rankIdx-1][fileIdx+1].occupied
              && boardStatus[rankIdx-1][fileIdx+1].occupied.color !== piece.color)
            || (fileArray[fileIdx+1] === specialInfo.enPassantAvailable[0]
              && tile.rank + 1 === specialInfo.enPassantAvailable[1]))
            ){
                moves.push([fileArray[fileIdx + 1], tile.rank + 1]);
            }

    // Black pawns: normal moves
    } else if (piece.color === "black") {
        if(!boardStatus[rankIdx+1][fileIdx].occupied) moves.push([tile.file, tile.rank - 1])
        if(tile.rank === 7){ // Let black pawns move 2 on first move:
            if(!(boardStatus[rankIdx+2][fileIdx].occupied || boardStatus[rankIdx+1][fileIdx].occupied)) moves.push([tile.file, 5]);
        }

        // Capturing
        if(fileIdx > 0 && rankIdx < 7
            && ((boardStatus[rankIdx+1][fileIdx-1].occupied
              && boardStatus[rankIdx+1][fileIdx-1].occupied.color === "white")
            || (fileArray[fileIdx-1] === specialInfo.enPassantAvailable[0]
              && tile.rank - 1 === specialInfo.enPassantAvailable[1]))
              
            ){
                moves.push([fileArray[fileIdx - 1], tile.rank - 1]);
            }
        if(fileIdx < 7 && rankIdx < 7
            && ((boardStatus[rankIdx+1][fileIdx+1].occupied
              && boardStatus[rankIdx+1][fileIdx+1].occupied.color === "white")
            || (fileArray[fileIdx+1] === specialInfo.enPassantAvailable[0]
              && tile.rank - 1 === specialInfo.enPassantAvailable[1]))
            ){
                moves.push([fileArray[fileIdx + 1], tile.rank - 1]);
            }


    }
    return moves;
}

module.exports = checkMoves;