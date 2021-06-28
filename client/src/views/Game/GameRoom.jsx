import { navigate } from "@reach/router";
import axios from "axios";
import React, {useState, useEffect} from "react";
import io from "socket.io-client";
import GameBoard from "../../components/Game/GameBoard";
import GamePlayerInfo from "../../components/Game/GamePlayerInfo";
import MoveLog from "../../components/Game/MoveLog";

const GameRoom = ({id, loggedIn}) => {

  const [socket] = useState( () => io(":8000"));
  const [spriteStyle, setSpriteStyle] = useState("");
  const [game, setGame] = useState(false);
  const [moveLog, setMoveLog] = useState(false);
  
  useEffect( () => {
    axios.get(`http://localhost:8000/api/games/${id}`)
      .then(res => {
        setGame(res.data.results);
        setMoveLog(res.data.results.moveLog);
      }).catch(err => console.error(err.errors));
  }, [id]);

  useEffect( () => {
    socket.emit("joinRoom", id);
    return () => socket.disconnect(true);
  }, [id]);

  useEffect( () => {
    socket.on("gameBegun", begunGame => {
      setGame(begunGame);
    });
    socket.on("removeGame", () => {
      navigate("/games");
    });
    socket.on("gameFinished", finishedGame => {
      setGame(finishedGame);
    });
    return () => socket.disconnect(true);
  }, []);

  const deleteGame = () => {
    axios.delete(`http://localhost:8000/api/games/${id}`, {withCredentials: true})
      .then(() => {
        socket.emit("gameDeleted", id);
        navigate("/games");
      })
      .catch(err => console.error({errors: err}));
  }

  const beginGame = () => {
    axios.put(`http://localhost:8000/api/games/${id}`, {begun: true}, {withCredentials: true})
      .then(rsp => {
        let begunGame = rsp.data.results;
        setGame(begunGame);
        socket.emit("startGame", {gameId: id, game: begunGame});
      })
      .catch(err => console.error({errors:err}));
  }

  const endGame = message => {
    axios.put(`http://localhost:8000/api/games/${id}`, {finished: message}, {withCredentials: true})
      .then(rsp => {
        let finishedGame = rsp.data.results;
        setGame(finishedGame);
        socket.emit("finishGame", finishedGame);
      })
      .catch(err => console.error({errors:err}));
  };

  return (
    <>
      {game? 
        <div className="mx-auto">
          <GamePlayerInfo
            socket={socket}
            gameId={id}
            loggedIn={loggedIn}
            origPlayers={{white: game.playerWhite, black: game.playerBlack}}
            beginGame={beginGame}
            begun={game.begun}
          />
        </div>
        :
        <>Loading...</>
      }
      
      <div className="mx-auto">
        <GameBoard
          socket={socket}
          loggedIn={loggedIn}
          statusFromParent={game? game.boardStatus : false}
          whiteToPlay={game? game.whiteToPlay : true}
          playerIds = {{
              white: game && game.playerWhite.length ? game.playerWhite[0]._id : "",
              black: game && game.playerBlack.length ? game.playerBlack[0]._id : ""
          }}
          begun={game? game.begun : false}
          endGame={endGame}
          finished={game? game.finished : false}
          gameId={id}
          specialInfo={game? game.specialInfo : false}
          spriteStyle={spriteStyle}
          moveLog={moveLog}
          setMoveLog={setMoveLog}
        />
      </div>
    
      <div className="mx-auto">
        <MoveLog moves={moveLog? moveLog : []} />
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