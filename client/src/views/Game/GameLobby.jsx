import Axios from "axios";
import React, {useState, useEffect} from "react";
import {Link} from "@reach/router";


const GameLobby = props => {

    const [gameList, setGameList] = useState(false);

    useEffect(() => {
        Axios.get(`http://localhost:8000/api/games`)
            .then(res => setGameList(res.data.results))
            .catch(err => console.log(err))
    }, [props])

    return (
        <>
            <h2>Ongoing games:</h2>
            {gameList? 
                gameList.map( (game, i) =>
                    <p key={i}>
                        Game {i+1}: &nbsp;
                        <Link to={`/games/${game._id}`}>
                        {game.type}, between {game.playerWhite.length?
                            game.playerWhite[0].userName :
                            "(no one joined)"} and {game.playerBlack.length?
                            game.playerBlack[0].userName :
                            "(no one joined)"}
                        </Link>
                    </p>
                )

                : <p>Loading...</p>}
        </>
    );
}

export default GameLobby;