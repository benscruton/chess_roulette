import {useState, useEffect} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
    HashRouter as Router, 
    Switch, 
    Route
  } from "react-router-dom";
import io from "socket.io-client";
import Nav from "./components/Global/Nav";
import Home from "./views/Home";
import LogReg from './views/User/LogReg';
import Show from './views/User/Show';
import Edit from './views/User/Edit';
import NewGame from './views/Game/NewGame';
import GameLobby from './views/Game/GameLobby';
import GameRoom from './views/Game/GameRoom';
import './App.css';

const App = () => {
  const [socket] = useState( () => io("/", {path: "/chessmainsocket"}));
  useEffect( () => {
    return () => socket.disconnect(true);
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const noUser = {
    firstName: "No One",
    lastName: "Logged In",
  };

  const [loggedIn, setLoggedIn] = useState(
    JSON.parse(localStorage.getItem("user")) || noUser
  );

  return (
    <Router>
      <div className="App d-flex flex-wrap justify-content-center">
        <Nav
          loggedIn={loggedIn}
          setLoggedIn={setLoggedIn}
          noUser={noUser}
          className="col-12"
        />
        <div className="col-lg-10 col-md-12">
          <Switch>
            <Route exact path="/">
              <Home
                loggedIn={loggedIn}
              />
            </Route>

            <Route exact path="/login">
              <LogReg
                setLoggedIn={setLoggedIn}
              />
            </Route>

            <Route exact path="/profile">
              <Show
                loggedIn={loggedIn}
              />
            </Route>

            <Route path="/profile/edit">
              <Edit
                loggedIn={loggedIn}
                setLoggedIn={setLoggedIn}
              />
            </Route>

            <Route path="/games/new">
              <NewGame
                socket={socket}
              />
            </Route>

            <Route exact path="/games">
              <GameLobby
                loggedIn={loggedIn}
                socket={socket}
              />
            </Route>
            
            <Route path="/games/:id">
              <GameRoom
                loggedIn={loggedIn}
                socket={socket}
              />
            </Route>
          </Switch>
        </div>
      </div>
    </Router>
  );
}

export default App;