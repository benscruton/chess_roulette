import React, {useState} from 'react';
import {navigate} from '@reach/router';
import Axios from "axios";

const NewGame = ({socket}) => {

  const [gameType, setGameType] = useState("placeholder");

  const handleSubmit = e => {
    e.preventDefault();
    Axios.post("http://localhost:8000/api/games/", {type: gameType})
      .then(rsp => {
        socket.emit("gameCreated", rsp.data.results);
        navigate(`/games/${rsp.data.results._id}`);
      })
      .catch(err => console.error({errors: err}));
  }

  const handleChange = e => {
      setGameType(e.target.value);
  }
  
  return (
    <>
      <h2 className=" mt-5">Create a new game!</h2>
      <form onSubmit = {handleSubmit}>
        <select className="w-50 my-5 p-2" name="type" id="type" onChange={handleChange} defaultValue="">
          <option value="placeholder">Select a game type...</option>
          <option value="Chess">Chess</option>
        </select>
        <br />
        <button type="submit" className=" btn btn-success" disabled={gameType === "placeholder"}>Create!</button>
      </form>
    </>
  );
}

export default NewGame;