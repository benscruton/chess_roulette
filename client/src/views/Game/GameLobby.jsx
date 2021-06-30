import Axios from "axios";
import React, {useState, useEffect, useRef} from "react";
import {Link} from "@reach/router";
import io from "socket.io-client";

const GameLobby = ({loggedIn}) => {

  const [socket] = useState( () => io(":8000"));
  const [gameList, setGameList] = useState(false);
  const [filteredGameList, setFilteredGameList] = useState(false);
  const [filter, setFilter] = useState("all");
  const [myGamesToggle, setMyGamesToggle] = useState(false);

  const gameListRef = useRef(gameList);

  const filterOptions = ["all", "unstarted", "ongoing", "finished", "joinable"];

  useEffect( () => {
    gameListRef.current = gameList;
  });

  useEffect( () => {
    Axios.get(`http://localhost:8000/api/games`)
      .then(res => {
        setGameList(res.data.results);
        setFilteredGameList(res.data.results);
      })
      .catch(err => console.error(err))
  }, []);

  useEffect( () => {
    socket.emit("joinRoom", "lobby");
    return () => socket.disconnect(true);
  }, []);

  useEffect( () => {
    socket.on("playerUpdate", data => {
      let list = JSON.parse(JSON.stringify(gameListRef.current));
      let ids = list.map(game => game._id);
      let idx = ids.indexOf(data.gameId);
      if(idx === -1){
        return;
      }
      list[idx][`player${data.color}`] = data.player;
      setGameList(list);
    });
    socket.on("removeGame", gameId => {
      let list = JSON.parse(JSON.stringify(gameListRef.current));
      let ids = list.map(game => game._id);
      let idx = ids.indexOf(gameId);
      if(idx === -1){
        return;
      }
      list.splice(idx, 1);
      setGameList(list);
    });
    socket.on("addGameToList", newGame => {
      let list = [...JSON.parse(JSON.stringify(gameListRef.current)), newGame];
      setGameList(list);
    });
  }, []);

  useEffect( () => {
    filterList(filter);
  }, [filter, myGamesToggle, gameList]);

  const handleChange = e => {
    setFilter(e.target.value);
  };

  const handleToggle = e => {
    setMyGamesToggle(!myGamesToggle);
  };

  const filterList = filter => {
    // "all", "my", "unstarted", "ongoing", "finished", "joinable"
    if(!gameList){
      return;
    }
    let updatedList = gameList;
    if(filter === "my"){
      updatedList = updatedList.filter(game => (game.playerWhite[0]?._id === loggedIn._id || game.playerBlack[0]?._id === loggedIn._id));
    }
    else if(filter === "ongoing"){
      updatedList = updatedList.filter(game => game.begun && !game.finished);
    }
    else if(filter === "unstarted"){
      updatedList = updatedList.filter(game => !game.begun);
    }
    else if(filter === "finished"){
      updatedList = updatedList.filter(game => game.finished);
    }
    else if(filter === "joinable"){
      updatedList = updatedList.filter(game => game.playerWhite.length + game.playerBlack.length < 2);
    }
    if(myGamesToggle){
      updatedList = updatedList.filter(game =>
        game.playerWhite[0]?._id === loggedIn._id || game.playerBlack[0]?._id === loggedIn._id
      );
    }
    setFilteredGameList(updatedList);
  };

  return (
    <>
      <h3>
        <select value={filter} onChange={handleChange} style={{border: "1px solid peru", backgroundColor: "white"}}>
          {filterOptions.map( (opt, idx) =>
            <option key={idx} value={opt}>
              {opt[0].toUpperCase() + opt.substring(1)}
            </option>
          )}
        </select> Games:
      </h3>
      <table className="table table-borderless p-0">
        <tbody>
          <tr>
            <td className="text-right p-0">All Games</td>
            <td className="p-0">
              <div className="custom-control custom-switch">
                <p>
                  <input
                    type="checkbox"
                    checked={myGamesToggle}
                    onChange={handleToggle}
                    className="custom-control-input"
                    id="customSwitches"
                  />
                <label className="custom-control-label" htmlFor="customSwitches">
                  &nbsp;
                </label>
                </p>
              </div>
            </td>
            <td className="text-left p-0">My Games</td>
          </tr>
        </tbody>
      </table>

      {filteredGameList? 
        filteredGameList.map( (game, i) =>
          <p key={i}>
            Game {gameList.indexOf(game) + 1}: &nbsp;
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