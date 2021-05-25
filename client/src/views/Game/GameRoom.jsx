import { navigate } from "@reach/router";
import axios from "axios";
import React, {useState, useEffect} from "react";
import GameBoard from "../../components/Game/GameBoard";

const GameRoom = ({id, loggedIn}) => {

    const [spriteStyle, setSpriteStyle] = useState("");
    const [game, setGame] = useState(false);
    
    useEffect( () => {
        axios.get(`http://localhost:8000/api/games/${id}`)
            .then(res => {
                setGame(res.data.results);
            }).catch(err => console.error(err.errors));
    }, [id]);

    const deleteGame = e => {
        axios.delete(`http://localhost:8000/api/games/${id}`)
            .then(() => navigate("/games"))
            .catch(err => console.error({errors: err}));
    }

    const joinGame = e => {
        axios.put(`http://localhost:8000/api/games/${id}/addPlayer${e.target.value}/${loggedIn._id}`)
            .then( () => {
                setGame({...game,
                    [`player${e.target.value}`]: [{_id: loggedIn._id, userName: loggedIn.userName}]
                });
            })
            .catch(err => console.error({errors: err}));
    }

    const leaveGame = e => {
        axios.put(`http://localhost:8000/api/games/${id}/removePlayer${e.target.value}/${loggedIn._id}`)
            .then( () => {
                console.log(`You are no longer ${e.target.value}.`);
                setGame({...game,
                    [`player${e.target.value}`]: []
                });
                console.log(game);
            })
            .catch(err => console.error({errors: err}));
    }

    const beginGame = () => {
        axios.put(`http://localhost:8000/api/games/${id}`, {begun: true})
            .then( () => {
                setGame({...game,
                    begun: true
                });
            })
            .catch(err => console.error({errors:err}));
    }

    return (
        <>
            <table className="table-borderless w-100">
                <tbody><tr>
                    <td>White:</td>
                    <td>Black:</td>
                </tr>
                <tr>
                    <td>
                        {game?
                            game.playerWhite.length ?
                                <h5>{game.playerWhite[0].userName}</h5> :
                                <button
                                    className="mb-2 mx-1 btn btn-light border border-dark"
                                    onClick={joinGame}
                                    value="White"
                                >
                                    Join as white
                                </button>
                            :
                            <>Loading...</>
                        }
                    </td>
                    <td>
                        {game?
                            game.playerBlack.length ?
                                <h5>{game.playerBlack[0].userName}</h5> :
                                <button
                                    className="mb-2 mx-1 btn btn-dark border"
                                    onClick={joinGame}
                                    value="Black"
                                >
                                    Join as black
                                </button>
                            :
                            <>Loading...</>
                        }
                    </td>
                </tr>
                <tr>
                    <td>
                        {game && game.playerWhite.length ?
                            !game.begun && game.playerWhite[0]._id === loggedIn._id ?
                                <button
                                    className="btn btn-danger"
                                    onClick={leaveGame}
                                    value="White"
                                >
                                    Leave Game
                                </button>
                                : ""
                            : ""
                        }
                    </td>

                    <td>
                        {game && game.playerBlack.length ?
                            !game.begun && game.playerBlack[0]._id === loggedIn._id?
                                <>
                                    <button
                                        className="btn btn-danger"
                                        onClick={leaveGame}
                                        value="Black"
                                    >
                                        Leave Game
                                    </button>
                                    <br />
                                </>
                                : ""
                            : ""
                        }
                    </td>
                </tr></tbody>
            </table>

            {game?
                !game.begun && game.playerBlack.length + game.playerWhite.length === 2?
                    <button
                        className="btn btn-success mt-2"
                        onClick={beginGame}
                    >
                        Begin game
                    </button>
                    : ""
                : ""
            }
            <div style={{margin: "0px auto"}}>
                <GameBoard
                    statusFromParent={game? game.boardStatus : false}
                    whiteToPlay={game? game.whiteToPlay : true}
                    parentLog={game? game.moveLog : []}
                    playerIds = {{
                        white: game && game.playerWhite.length ? game.playerWhite[0]._id : "",
                        black: game && game.playerBlack.length ? game.playerBlack[0]._id : ""
                    }}
                    begun={game? game.begun : false}
                    gameId={id}
                    specialInfo={game? game.specialInfo : false}
                    spriteStyle={spriteStyle}
                />
            </div>
            <div>
                <h5 className="mt-2">Sprite style:</h5>
                <button className="btn btn-primary mx-2" onClick={() => setSpriteStyle("")}>Normal</button>
                <button className="btn btn-primary mx-2" onClick={() => setSpriteStyle("crappy")}>Crappy</button>
            </div>
            <button className="btn btn-danger my-5" onClick={deleteGame}>Delete this game</button>
        </>
    );
}

export default GameRoom;