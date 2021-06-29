import { navigate } from "@reach/router";
import axios from "axios";
import React, {useState, useEffect} from "react";
import io from "socket.io-client";
import GamePlayerInfo from "../../components/Game/GamePlayerInfo";
import DrawOffer from "../../components/Game/DrawOffer";
import GameBoard from "../../components/Game/GameBoard";
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
    socket.on("gameBegun", game => {
      setGame(game);
    });
    socket.on("removeGame", () => {
      navigate("/games");
    });
    socket.on("gameFinished", game => {
      setGame(game);
    });
    socket.on("drawOfferUpdate", game => {
      setGame(game);
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
        socket.emit("startGame", begunGame);
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

  const offerDraw = (e, reject = false) => {
    if(!game || !loggedIn._id){
      return;
    }
    let drawOfferedTo = false;
    if(reject){
      console.log(reject);
      drawOfferedTo = "";
    } else if(game.playerWhite[0]._id === loggedIn._id){
      drawOfferedTo = game.playerBlack[0]._id;
    } else {
      drawOfferedTo = game.playerWhite[0]._id;
    }
    console.log(drawOfferedTo);
    axios.put(`http://localhost:8000/api/games/${id}`, {drawOfferedTo}, {withCredentials: true})
      .then(rsp => {
        let gameWithDrawOffer = rsp.data.results;
        setGame(gameWithDrawOffer);
        socket.emit("updateDraw", gameWithDrawOffer);
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

      {game && !game.finished && game.drawOfferedTo ?
        <DrawOffer
          loggedIn={loggedIn}
          offeredTo={game.drawOfferedTo}
          playerWhite={game.playerWhite[0]}
          playerBlack={game.playerBlack[0]}
          endGame={endGame}
          offerDraw={offerDraw}
        />
        :
        <></>
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
          offerDraw={offerDraw}
          drawOfferPending={game? game.drawOfferedTo.length > 0 : false}
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