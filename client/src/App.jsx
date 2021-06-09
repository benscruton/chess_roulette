import {useState} from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Router} from '@reach/router';
import Nav from "./components/Global/Nav";
import Edit from './views/User/Edit';
import Show from './views/User/Show';
// import Main from './views/Main';
import GameRoom from './views/Game/GameRoom';
import LogReg from './views/User/LogReg';
import NewGame from './views/Game/NewGame';
import GameLobby from './views/Game/GameLobby';
import './App.css';

// import io from 'socket.io-client';

const App = () => {

  const noUser = {
    firstName: "No One",
    lastName: "Logged In",
  };

  const [loggedIn, setLoggedIn] = useState(
    JSON.parse(localStorage.getItem("user")) || noUser
  );


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
      <Nav
        loggedIn={loggedIn}
        setLoggedIn={setLoggedIn}
        noUser={noUser}
        className="col-12"
      />
      <div className="col-lg-8 col-md-10 col-sm-12">
        <Router>
          <LogReg path="/" setLoggedIn={setLoggedIn}/>
          {/* <Main path="/dashboard" /> */}
          <Edit path="/users/:id/edit" loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
          <Show path="/users/:id" loggedIn={loggedIn} />

          <NewGame path="/games/new" />
          <GameLobby path="/games" />
          <GameRoom path="/games/:id" loggedIn={loggedIn}/>
        </Router>
      </div>
    </div>
  );
}

export default App;
