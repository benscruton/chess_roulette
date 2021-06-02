import {useState, useEffect} from "react";
import axios from "axios";

const GamePlayerInfo = (props) => {

  const {
    socket,
    gameId,
    loggedIn,
    origPlayers,
    // joinGame,
    // leaveGame,
    beginGame,
    begun
  } = props;

  const [playerWhite, setPlayerWhite] = useState([]);
  const [playerBlack, setPlayerBlack] = useState([]);
  const players = {white: playerWhite, black: playerBlack};

  useState( () => {
    setPlayerWhite(origPlayers.white);
    setPlayerBlack(origPlayers.black);
  }, [origPlayers]);

  const joinGame = e => {
    axios.put(`http://localhost:8000/api/games/${gameId}/addPlayer${e.target.value}/${loggedIn._id}`)
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
    axios.put(`http://localhost:8000/api/games/${gameId}/removePlayer${e.target.value}/${loggedIn._id}`)
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
    console.log("lookin' for somethin'?");

    socket.on("playerUpdate", data => {
      console.log(data);
      if(data.color === "White"){
        setPlayerWhite(data.player);
      } else if(data.color === "Black") {
        setPlayerBlack(data.player);
      }
    });

    return (() => socket.disconnect(true));
  }, []);


  const colors = ["white", "black"];

  return (
    <>
      <table className="table-borderless w-100">
        <tbody>
          <tr>
            <td>White:</td>
            <td>Black:</td>
          </tr>
          <tr>
            {colors.map( (color, idx) =>
              <td key={idx}>
                {players[color].length ?
                    <h5>{players[color][0].userName}</h5> :
                    <button
                      className={`mb-2 mx-1 btn border ${color === "white" ? "btn-light border-dark" : "btn-dark"}`}
                      onClick={joinGame}
                      value={color[0].toUpperCase() + color.substring(1)}
                    >
                      Join as {color}
                    </button>
                }
              </td>
            )}
          </tr>

          <tr>
            {colors.map( (color, idx) =>
            <td key={idx}>
              {players[color].length ?
                !begun && players[color][0]._id === loggedIn._id ?
                    <button
                      className="btn btn-danger"
                      onClick={leaveGame}
                      value={color[0].toUpperCase() + color.substring(1)}
                    >
                      Leave Game
                    </button>
                    : ""
                  : ""
                }
            </td>
            )}
          </tr>
        </tbody>
      </table>

      {!begun && players.black.length && players.white.length ?
        <button
          className="btn btn-success mt-2"
          onClick={beginGame}
        >
          Begin game
        </button>
        : ""
      }

    </>
  );
}

export default GamePlayerInfo;























// THE ORIGINAL, FULLY-WRITTEN-OUT PLAYER INFO TABLE, FOR REFERENCE:

{/* <table className="table-borderless w-100">
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
      {game ?
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
} */}