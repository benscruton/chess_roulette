import {useState, useEffect} from "react";
import axios from "axios";
import NotLoggedInPopover from "../Global/NotLoggedInPopover";

const GamePlayerInfo = ({socket, gameId, loggedIn, origPlayers, beginGame, begun}) => {

  const [playerWhite, setPlayerWhite] = useState([]);
  const [playerBlack, setPlayerBlack] = useState([]);
  const players = {white: playerWhite, black: playerBlack};

  useEffect( () => {
    setPlayerWhite(origPlayers.white);
    setPlayerBlack(origPlayers.black);
  }, [origPlayers]);

  const joinGame = e => {
    if(!loggedIn.email){
      return;
    }
    axios.put(`http://localhost:8000/api/games/${gameId}/addPlayer${e.target.value}/${loggedIn._id}`, null, {withCredentials: true})
      .catch(err => console.error({errors: err}));
      
    let player = [{
      _id: loggedIn._id,
      userName: loggedIn.userName
    }];
    let socketInfo = {
      gameId,
      player,
      color: e.target.value
    };
    socket.emit("newPlayer", socketInfo);
    if(e.target.value === "White"){
      setPlayerWhite(player);
    } else if(e.target.value === "Black") {
      setPlayerBlack(player);
    }
  }

  const leaveGame = e => {
    axios.put(`http://localhost:8000/api/games/${gameId}/removePlayer${e.target.value}/${loggedIn._id}`, null, {withCredentials: true})
      .catch(err => console.error({errors: err}));

    let socketInfo = {
      gameId,
      player: [],
      color: e.target.value
    };
    socket.emit("newPlayer", socketInfo);
    if(e.target.value === "White"){
      setPlayerWhite([]);
    } else if(e.target.value === "Black") {
      setPlayerBlack([]);
    }
  }

  useEffect( () => {
    socket.on("playerUpdate", data => {
      if(data.color === "White"){
        setPlayerWhite(data.player);
      } else if(data.color === "Black") {
        setPlayerBlack(data.player);
      }
    });
    return () => socket.removeAllListeners("playerUpdate");
  }, []);

  const colors = ["white", "black"];

  return (
    <>
      <table className="table-borderless w-100">
        <tbody>
          <tr>
            <td className="w-50">White:</td>
            <td className="w-50">Black:</td>
          </tr>
          <tr>
            {colors.map( (color, idx) =>
              <td key={idx}>
                {players[color].length ?
                    <h5>
                      {players[color][0].userName}
                    </h5>
                    :
                    <NotLoggedInPopover
                      loggedIn={loggedIn}
                      action="join a game"
                      placement="bottom"
                    >
                      <button
                        className={
                          `mb-2 mx-1 btn border ${
                            color === "white" ? "btn-light border-dark" : "btn-dark"
                          }`
                        }
                        onClick={joinGame}
                        value={color[0].toUpperCase() + color.substring(1)}
                      >
                        Join as {color}
                      </button>
                    </NotLoggedInPopover>
                }
              </td>
            )}
          </tr>

          <tr>
            {colors.map( (color, idx) =>
            <td key={idx}>
              {players[color].length && !begun && players[color][0]._id === loggedIn._id ?
                <button
                  className="btn btn-danger"
                  onClick={leaveGame}
                  value={color[0].toUpperCase() + color.substring(1)}
                >
                  Leave Game
                </button>
                : <></>
              }
            </td>
            )}
          </tr>
        </tbody>
      </table>

      {!begun && players.black.length && players.white.length && (players.black[0]._id === loggedIn._id || players.white[0]._id === loggedIn._id)?
        <button
          className="btn btn-success mt-2"
          onClick={beginGame}
        >
          Begin game
        </button>
        : <></>
      }

    </>
  );
}

export default GamePlayerInfo;