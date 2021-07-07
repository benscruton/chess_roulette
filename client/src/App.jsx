import {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Router} from '@reach/router';
import Nav from "./components/Global/Nav";
import Edit from './views/User/Edit';
import Show from './views/User/Show';
import GameRoom from './views/Game/GameRoom';
import LogReg from './views/User/LogReg';
import NewGame from './views/Game/NewGame';
import GameLobby from './views/Game/GameLobby';
import './App.css';

const App = () => {

  const noUser = {
    firstName: "No One",
    lastName: "Logged In",
  };

  const [loggedIn, setLoggedIn] = useState(
    JSON.parse(localStorage.getItem("user")) || noUser
  );

  return (
    <div className="App d-flex flex-wrap justify-content-center">
      <Nav
        loggedIn={loggedIn}
        setLoggedIn={setLoggedIn}
        noUser={noUser}
        className="col-12"
      />
      <div className="col-lg-10 col-md-12">
        <Router>
          <LogReg path="/" setLoggedIn={setLoggedIn} />
          <Edit path="/profile/edit" loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
          <Show path="/profile" loggedIn={loggedIn} />

          <NewGame path="/games/new" />
          <GameLobby path="/games" loggedIn={loggedIn} />
          <GameRoom path="/games/:id" loggedIn={loggedIn} />
        </Router>
      </div>
    </div>
  );
}

export default App;