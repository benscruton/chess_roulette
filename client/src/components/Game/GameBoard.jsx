import {useState, useEffect} from "react";
import Axios from "axios";

import styles from "./GameBoard.module.css";
import io from "socket.io-client";

import images from "./ImageSets/standardChess";
import PawnPromotion from "../Game/PawnPromotion";
const rules = require("./MoveLogic/StandardChess/standardChessMoves");

const GameBoard = ({statusFromParent, gameId, parentLog, specialInfo, begun, playerIds, spriteStyle}) => {

    const [socket] = useState( () => io(":8000"));
    const [loggedIn] = useState(JSON.parse(localStorage.getItem("user")) || {
        firstName:"No One",
        lastName: "LoggedIn"
    });
    const [availableMoves, setAvailableMoves] = useState(false);
    const [thisUserMoves, setThisUserMoves] = useState(0);
    const [boardStatus, setBoardStatus] = useState(false);
    const [whiteToPlay, setWhiteToPlay] = useState(true);
    const [activeTile, setActiveTile] = useState(false);
    const [pawnReady, setPawnReady] = useState(true);
    const [moveLog, setMoveLog] = useState([]);
    const [info, setInfo] = useState({});
    const [viewAsBlack, setViewAsBlack] = useState(false);

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
        setMoveLog(parentLog);
    }, [parentLog]);

    useEffect( () => {
        setInfo({...specialInfo});
    }, [specialInfo]);

    useEffect( () => {
        console.log(loggedIn._id);
        console.log(playerIds);
        if(loggedIn._id === playerIds.black){
            console.log("you are playing as black");
            // console.log(playerIds.black);
            if(loggedIn._id !== playerIds.white){
                setViewAsBlack(true);
            }
        }
        else{
            setViewAsBlack(false);
        }
    }, [playerIds]);

    // every time we make a move, send to socket
    useEffect(() => {
        if(boardStatus !== false){
            socket.emit("madeAMove", {boardStatus, whiteToPlay, info, moveLog});
        }
    }, [thisUserMoves])

    // when a new move comes in, update the board status
    useEffect( () => {
        socket.on("newMoveCameIn", data => {
            console.log("received a thing");         

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
        if(movesToHere(tile)){
            // Make sure 1) game has begun, 2) it is their turn, and 3) it's the right player
            if(begun
                && (activeTile.occupied.color === "white") - (whiteToPlay) === 0
                && playerIds[whiteToPlay ? "white" : "black"] === loggedIn._id
            ){

                // build the chess-notation description of the move:
                let moveDescription = "";
                moveDescription += activeTile.occupied.type !== "pawn" ? activeTile.occupied.abbrev :
                    tile.occupied? activeTile.file.toLowerCase() : "";
                moveDescription += tile.occupied? "x" : "";
                moveDescription += tile.file.toLowerCase() + tile.rank;

                // make move on front end:
                tile.occupied = activeTile.occupied;
                activeTile.occupied = false;
                setActiveTile(false);
                setAvailableMoves(false);

                const rankIdx = 8 - tile.rank;
                const fileArray = ["A", "B", "C", "D", "E", "F", "G", "H"];
                const fileIdx = fileArray.indexOf(tile.file);
                // Special Case: En Passant
                    // facilitate capturing
                    if(tile.occupied.type === "pawn" && tile.file === info.enPassantAvailable[0] && tile.rank === info.enPassantAvailable[1]){
                        boardStatus[tile.occupied.color === "white" ? 3 : 4][fileIdx].occupied = false;
                        moveDescription = `${activeTile.file.toLowerCase()}x`+ moveDescription;
                    }
                    // update special info if necessary
                    let enPassant = false;
                    if((tile.occupied.type === "pawn") && ((Math.abs(activeTile.rank - tile.rank)) === 2)){
                        enPassant = [tile.file, (tile.rank + activeTile.rank)/2];
                    }
                    // setInfo({...info, enPassantAvailable: enPassant});
                
                // Special Case: Castling
                    // facilitate rooks also moving
                    if(tile.occupied.type === "king" && Math.abs(fileIdx - fileArray.indexOf(activeTile.file)) === 2){
                        if(tile.file === "G"){
                            boardStatus[rankIdx][5].occupied = {...boardStatus[rankIdx][7].occupied};
                            boardStatus[rankIdx][7].occupied = false;
                            moveDescription = "O-O";
                        }
                        if(tile.file === "C"){
                            boardStatus[rankIdx][3].occupied = {...boardStatus[rankIdx][0].occupied};
                            boardStatus[rankIdx][0].occupied = false;
                            moveDescription = "O-O-O";
                        }
                    }
                    // update special info if necessary
                    // rooks:
                    let castlingLegalAfterThisMove = {...info.castlingLegal};
                    let castleFilesRooks = ["A", "H"], castleRanks = [1, 8];
                    for(let file of castleFilesRooks){
                        for(let rank of castleRanks){
                            // console.log(file, rank);
                            if((tile.file === file && tile.rank === rank) || (activeTile.file === file && activeTile.rank === rank)){
                                castlingLegalAfterThisMove[`${file}${rank}`] = false;
                            }
                        }
                    }
                    // kings:
                    if(activeTile.file === "E" && (activeTile.rank === 1 || activeTile.rank === 8)){
                        castlingLegalAfterThisMove[`A${activeTile.rank}`] = false;
                        castlingLegalAfterThisMove[`E${activeTile.rank}`] = false;
                        castlingLegalAfterThisMove[`H${activeTile.rank}`] = false;
                    }
                
                // Update special info on the front end:
                    setInfo({...info,
                        castlingLegal: castlingLegalAfterThisMove,
                        enPassantAvailable: enPassant
                    });
                    

                // add the new move to the move log (which is an array of move pairs):
                const moveLogTemp = [...moveLog];
                if((moveLogTemp.length > 0) && (moveLogTemp[moveLogTemp.length-1].length === 1)){
                    moveLogTemp[moveLogTemp.length-1].push(moveDescription);
                } else {
                    moveLogTemp.push([moveDescription])
                }
                setMoveLog(moveLogTemp);
                
                // send move to database:
                Axios.put(`http://localhost:8000/api/games/${gameId}`, {boardStatus, whiteToPlay: !whiteToPlay, moveLog: moveLogTemp, $set: {"specialInfo.enPassantAvailable": enPassant, "specialInfo.castlingLegal": castlingLegalAfterThisMove}})
                    // .then(setWhiteToPlay(!whiteToPlay))
                    .catch(err => console.error({errors: err}))
                
                setWhiteToPlay(!whiteToPlay);
                setThisUserMoves(thisUserMoves + 1);
            }

            // if it's not this player's turn
            else{
                setActiveTile(false);
                setAvailableMoves(false);
            }
            return;
        }

        if(tile.occupied){
            setActiveTile(tile);
            setAvailableMoves(rules[tile.occupied.type](tile, boardStatus, info))
        }
        else{
            setActiveTile(false);
            setAvailableMoves(false);
        }
    }

    const movesToHere = tile => {
        for(let i=0; i<availableMoves.length; i++){
            if(availableMoves[i][0] === tile.file && availableMoves[i][1] === tile.rank) return true;
        }
        return false;
    }

    return (
        <div id="board">
            <h3>{whiteToPlay? "White" : "Black"}'s move</h3>

            {pawnReady?
                <PawnPromotion
                    images={images}
                    spriteStyle={spriteStyle}
                    whiteToPlay={whiteToPlay}
                />
                :
                <></>
            }

            <div className={viewAsBlack? styles.boardContainerBlack : styles.boardContainer}>
                {boardStatus?
                    boardStatus.map( (row, i) =>
                        <div className={viewAsBlack? styles.tileRowBlack : styles.tileRowWhite} key={i}>
                            {row.map( (tile, j) =>
                                <div
                                    className={`
                                        ${styles.tile}
                                        ${(i+j) % 2 === 0? styles.white : styles.black}
                                        ${activeTile.file === tile.file && activeTile.rank === tile.rank ? styles.active : ""}
                                        ${movesToHere(tile) ? 
                                            tile.occupied? styles.capture : styles.available
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
            <button className="btn btn-warning my-2" onClick = {() => setViewAsBlack(!viewAsBlack)}>Flip board</button>

            <h3>Moves:</h3>
            <table className="table-bordered table-striped w-100">
                <thead>
                    <tr>
                        <th>White:</th>
                        <th>Black:</th>
                    </tr>
                </thead>
                <tbody>
                    {moveLog.map( (movePair, i) =>
                        <tr key={i}>
                            {movePair.map( (move, j) =>
                                <td key={j}>{move}</td>
                            )}
                        </tr>
                    )}
                </tbody>
            </table>

        </div>
    );
}

export default GameBoard;