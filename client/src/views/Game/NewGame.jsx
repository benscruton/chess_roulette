import React, {useState} from 'react';
import {navigate} from '@reach/router';
import Axios from "axios";

const NewGame = ({socket}) => {
  const variants = ["standardChess"];

  const separateCamelCase = str => {
    let output = str.split("")
      .map(char => char === char.toLowerCase() ? char : " " + char);
    output[0] = output[0].toUpperCase();
    return output.join("");
  }

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
      <h2 className="mt-5">Create a new game:</h2>
      <form onSubmit = {handleSubmit}>
        <select
          className="mt-5 mb-3 p-2"
          name="type"
          id="type"
          onChange={handleChange}
          defaultValue="placeholder"
        >
          <option value="placeholder" disabled>Select a game type...</option>
          {variants.map( (variant, idx) =>
            <option value={variant} key={idx}>
              {separateCamelCase(variant)}
            </option>
          )}
        </select>
        <br />
        <button type="submit" className=" btn btn-success" disabled={gameType === "placeholder"}>Create!</button>
      </form>
    </>
  );
}

export default NewGame;