import {useParams, useHistory} from "react-router-dom";
import axios from "axios";
import {useState, useEffect, useContext} from "react";
import AppContext from "../../context/AppContext";
import GamePlayerInfo from "../../components/Game/GamePlayerInfo";
import DrawOffer from "../../components/Game/DrawOffer";
import GameBoard from "../../components/Game/GameBoard";
import MoveLog from "../../components/Game/MoveLog";

const GameRoom = ({loggedIn, socket}) => {
  const {serverUrl} = useContext(AppContext);
  const {id} = useParams();
  const history = useHistory();
  const navigate = path => history.push(path);

  const [spriteStyle, setSpriteStyle] = useState(
    localStorage.getItem("cr_sprite_style") || ""
  );
  const [game, setGame] = useState(false);
  const [moveLog, setMoveLog] = useState(false);
  
  useEffect( () => {
    axios.get(`${serverUrl}/api/games/${id}`)
      .then(res => {
        setGame(res.data.results);
        setMoveLog(res.data.results.moveLog);
      }).catch(err => console.error(err.errors));
  }, [id, serverUrl]);

  useEffect( () => {
    socket.emit("joinRoom", id);

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
    socket.on("reconnect", () => {
      console.log("Socket reconnecting...");
    });
    socket.on("connect", () => {
      socket.emit("joinRoom", id);
      console.log("Socket connection established!");
    });

    return () => socket.emit("leaveRoom", id);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const deleteGame = () => {
    axios.delete(`${serverUrl}/api/games/${id}`, {withCredentials: true})
      .then(() => {
        socket.emit("gameDeleted", id);
        navigate("/games");
      })
      .catch(err => console.error({errors: err}));
  }

  const beginGame = () => {
    axios.put(`${serverUrl}/api/games/${id}/begin`, null, {withCredentials: true})
      .then(rsp => {
        if(rsp.data.incomplete){
          return;
        }
        let begunGame = rsp.data.results;
        setGame(begunGame);
        socket.emit("startGame", begunGame);
      })
      .catch(err => console.error({errors:err}));
  }

  const endGame = message => {
    axios.put(`${serverUrl}/api/games/${id}`, {finished: message}, {withCredentials: true})
      .then(rsp => {
        let finishedGame = rsp.data.results;
        setGame(finishedGame);
        socket.emit("finishGame", finishedGame);
      })
      .catch(err => console.error({errors:err}));
  };

  const offerDraw = e => {
    if(!game || !loggedIn._id){
      return;
    }
    let reject = !(JSON.parse(e.target.value));
    let drawOfferedTo = false;
    if(reject){
      drawOfferedTo = "";
    } else if(game.playerWhite[0]._id === loggedIn._id){
      drawOfferedTo = game.playerBlack[0]._id;
    } else {
      drawOfferedTo = game.playerWhite[0]._id;
    }
    axios.put(`${serverUrl}/api/games/${id}`, {drawOfferedTo}, {withCredentials: true})
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
          origLastMove = {game? game.lastMove : []}
          origStatus={game? game.boardStatus : false}
          whiteToPlay={game? game.whiteToPlay : true}
          playerIds = {{
              white: game && game.playerWhite.length ? game.playerWhite[0]._id : "",
              black: game && game.playerBlack.length ? game.playerBlack[0]._id : ""
          }}
          begun={game? game.begun : false}
          endGame={endGame}
          finished={game? game.finished : false}
          gameId={id}
          gameType={game? game.type : ""}
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

      <div className="mb-5">
        <h5 className="mt-2">Sprite style:</h5>
        <button className="btn btn-info mx-2" onClick={() => {
          setSpriteStyle("");
          localStorage.setItem("cr_sprite_style", "");
        }}>
          Default
        </button>
        <button className="btn btn-info mx-2" onClick={() => {
          setSpriteStyle("triangle");
          localStorage.setItem("cr_sprite_style", "triangle");
        }}>
          Triangle
        </button>
        <button className="btn btn-info mx-2" onClick={() => {
          setSpriteStyle("crappy");
          localStorage.setItem("cr_sprite_style", "crappy");
        }}>
          Crappy
        </button>
      </div>

      <button className="btn btn-danger my-5" onClick={deleteGame}>
        Delete this game
      </button>
    </>
  );
}

export default GameRoom;