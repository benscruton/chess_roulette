import React from "react";
import styles from "./Home.module.css";
import {Link} from "react-router-dom";

const Home = ({loggedIn}) => {

  return (
    <div className={styles.wrapper}>
      <div className={styles.logoHolder}>
        <h1>
          Welcome to
        </h1>
        <h1>
          Chess Roulette
        </h1>
      </div>

      <p className={styles.helloUser}>
        {loggedIn.email ?
          <>Welcome back, <Link to="/profile">{loggedIn.userName}</Link>!</>
          :
          <Link to="/">Click here to log in or register</Link>
        }
      </p>

      <ul className={styles.features}>
        <li>
          Play chess against other users, or against yourself
        </li>
        <li>
          Games update in real time, even across different browsers and devices -- no need for page refreshes
        </li>
        <li>
          Visit <Link to="/games">Games</Link> to browse existing games, or <Link to="/games/new">New Game</Link> to create your own
        </li>
        <li>
          Fischer Random Chess coming soon; additional variants to follow!
        </li>
      </ul>
    </div>
  );
};

export default Home;