import Axios from "axios";
import React, {useState, useEffect} from "react";
import {Link} from "@reach/router";
import io from "socket.io-client";

const GameLobby = props => {

  const [socket] = useState( () => io(":8000"));
  const [gameList, setGameList] = useState(false);

  useEffect( () => {
    Axios.get(`http://localhost:8000/api/games`)
      .then(res => setGameList(res.data.results))
      .catch(err => console.log(err))
  }, [props])

  useEffect( () => {
    socket.emit("joinRoom", "lobby");
    return () => socket.disconnect(true);
  }, []);

  useEffect( () => {
    socket.on("playerUpdate", data => {
      console.log(data);
    });
  }, []);

  // useEffect( () => {
  //   if(gameList){
  //     // socket.disconnect(true);
  //     socket.on("playerUpdate", data => {
  //       let gameIdList = gameList.map(game => game._id);
  //       let idx = gameIdList.indexOf(data.gameId);
  //       let gameListCopy = JSON.parse(JSON.stringify(gameList));
  //       gameListCopy[idx][`player${data.color}`] = data.player;
  //       setGameList(gameListCopy);
  //     });
  //   }
  // }, [gameList]);

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
              "________"} and {game.playerBlack.length?
              game.playerBlack[0].userName :
              "________"}
            </Link>
          </p>
        )

        : <p>Loading...</p>}
    </>
  );
}

export default GameLobby;