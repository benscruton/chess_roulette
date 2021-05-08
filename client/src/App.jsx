import {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Router, Link, navigate} from '@reach/router';
import blarg from "axios";
// import Create from './views/User/Create';
import Edit from './views/User/Edit';
import Show from './views/User/Show';
import Main from './views/Main';
import GameRoom from './views/Game/GameRoom';
import LogReg from './views/User/LogReg';
import NewGame from './views/Game/NewGame';
import GameLobby from './views/Game/GameLobby';
import './App.css';

// import io from 'socket.io-client';

const App = () => {

  const [loggedIn] = useState(
    JSON.parse(localStorage.getItem("user")) || {
      firstName: "No One",
      lastName: "LoggedIn",
    }
  );

  const logout = e => {
    e.preventDefault();
    blarg.get(`http://localhost:8000/api/logout`, { withCredentials: true })
      .then((res) => {
        localStorage.clear();
        navigate("/");
      })
      .catch((err) => console.log(err));
  };

// const [loggedIn, setLoggedIn] = useState(JSON.parse(localStorage.getItem("user")) || 
//   {
//     firstName:"No One",
//     lastName: "LoggedIn"
//   })
// const [socket] = useState(() => io(":8000"))
// const [input, setInput] = useState("");
// const [messages, setMessages] = useState([])

// useEffect(() => {
//   socket.on("welcome", data => console.log(data))
//   socket.on("joined", data => console.log(data))
//   socket.on("updatingMessages", data => setMessages(data))
//   return () => socket.disconnect(true);
// }, [socket])

// const sendToServer = () => {
//   socket.emit("addToChat", input);
//   setInput("");
// }

  return (
    <div className="App d-flex flex-wrap justify-content-center">
      {/* <nav className="d-flex col-sm-12 col-md-12 col-lg-12 mx-auto justify-content-around flex-wrap"> */}

      {/* <nav className="navbar navbar-default col-12">
        <Link to="/dashboard">Home</Link>
        <Link to="/games">All Games</Link>
        <Link to="/games/new">New Game</Link>
      </nav> */}

      <nav className="navbar navbar-expand-md bg-info col-12 mb-1 d-flex">
        {/* <div className="container-fluid"> */}
          {/* <button
            className="navbar-toggler"
            type="button"
            data-mdb-toggle="collapse"
            data-mdb-target="#navbarExample01"
            aria-controls="navbarExample01"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <i className="fas fa-bars"></i>
          </button> */}
          {/* <div className="collapse navbar-collapse" id="navbarExample01"> */}
            <div>
              <h2 className="font-italic" style={{color: "navajowhite"}}>Chess Roulette</h2>
            </div>
            <ul className="navbar-nav ml-auto">
              <li className="nav-item mx-lg-3 mx-md-1">
                <Link className="nav-link text-light" to={`/users/${loggedIn._id}`}>Profile</Link>
              </li>
              <li className="nav-item mx-lg-3 mx-md-1">
                <Link className="nav-link text-light" to="/games">All Games</Link>
              </li>
              <li className="nav-item mx-lg-3 mx-md-1">
                <Link className="nav-link text-light" to="/games/new">New Game</Link>
              </li>
              <li className="nav-item mx-lg-3 mx-md-1">
                <a className="nav-link text-light btn btn-danger" href="/logout" onClick={logout}>Log Out</a>
              </li>
            </ul>
          {/* </div> */}
        {/* </div> */}
      </nav>




      {/* <div className="form-group border col-4 d-flex align-items-end">
        <div style={{height: "100%"}} className="col-12 p-3">
          <div style={{height: "88%"}} className="form-control col-12 border text-left align-bottom">
            {
              messages.map((m,i) => <p key={i}>{loggedIn.userName}: {m}</p> )
            }
          </div>
          <div className="input-group">
            <input 
              className="form-control" 
              type="text" 
              value={input} 
              onChange={(e) => {setInput(e.target.value)}} 
            />
            <div className="input-group-append">
              <button 
                onClick={sendToServer}
                className="btn btn-primary"
                type="submit"
                >Send
              </button>
            </div>
          </div>
        </div>
      </div> */}
      <div className="col-lg-8 col-md-10 col-sm-12">
        <Router>
          <LogReg path="/" />
          <Main path="/dashboard" />
          {/* <Create path="/users/new" /> */}
          <Edit path="/users/:id/edit" />
          <Show path="/users/:id" />

          {/* <GameRoom path="/games" /> */}
          <NewGame path="/games/new" />
          <GameLobby path="/games" />
          <GameRoom path="/games/:id" />
        </Router>
      </div>
    </div>
  );
}

export default App;
