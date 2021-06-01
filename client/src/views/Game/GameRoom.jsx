import { navigate } from "@reach/router";
import axios from "axios";
import React, {useState, useEffect} from "react";
import io from "socket.io-client";
import GameBoard from "../../components/Game/GameBoard";
import GamePlayerInfo from "../../components/Game/GamePlayerInfo";

const GameRoom = ({id, loggedIn}) => {

  const [socket] = useState( () => io(":8000"));
  const [spriteStyle, setSpriteStyle] = useState("");
  const [game, setGame] = useState(false);
  
  useEffect( () => {
    axios.get(`http://localhost:8000/api/games/${id}`)
      .then(res => {
        setGame(res.data.results);
      }).catch(err => console.error(err.errors));
  }, [id]);

  useEffect( () => {
    socket.emit("joinRoom", id);
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
        console.log(`You are no longer joined as ${e.target.value}.`);
        setGame({...game,
          [`player${e.target.value}`]: []
        });
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
      {game? 
        <GamePlayerInfo
          loggedIn={loggedIn}
          players={{white: game.playerWhite, black: game.playerBlack}}
          joinGame={joinGame}
          leaveGame={leaveGame}
          beginGame={beginGame}
          begun={game.begun}
        />
        :
        <>Loading...</>
      }

      <div className="mx-auto">
        <GameBoard
          socket={socket}
          loggedIn={loggedIn}
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