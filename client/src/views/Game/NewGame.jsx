import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import Axios from "axios";
import separateCamelCase from "../../utils/separateCamelCase";

const NewGame = ({socket}) => {
  const history = useHistory();
  const navigate = path => history.push(path);

  const variants = ["standardChess"];
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