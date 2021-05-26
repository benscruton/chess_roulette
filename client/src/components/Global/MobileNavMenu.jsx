import React from "react";
import {Link, navigate} from "@reach/router";
import styles from "./MobileNavMenu.module.css";
import {List} from "react-bootstrap-icons";

const MobileNavMenu = ({loggedIn, logout, toggleMenu}) => {

  const logoutAndToggleMenu = e => {
    e.preventDefault();
    logout(e);
    toggleMenu();
    // navigate("/");
  }

  return (
    <>
      <div className={styles.shadow} onClick={toggleMenu}></div>
      <ul className={`navbar-nav ${styles.block}`}>

        <button
          className={`navbar-toggler ${styles.menuIcon}`}
          onClick={toggleMenu}
        >
          <List />
        </button>

        {loggedIn.email ?
          <li>
            <Link
              className={`nav-link ${styles.navlink}`}
              to={`/users/${loggedIn._id}`}
              onClick={toggleMenu}
            >
              Profile
            </Link>
          </li>
          :
          <></>
        }

        <li>
          <Link
            className={`nav-link ${styles.navlink}`}
            to="/games"
            onClick={toggleMenu}
          >
            All Games
          </Link>
        </li>

        <li>
          <Link
            className={`nav-link ${styles.navlink}`}
            to="/games/new"
            onClick={toggleMenu}
          >
            New Game
          </Link>
        </li>

        {loggedIn.email ?
          <li>
            <Link
              className={`nav-link ${styles.logoutlink}`}
              to="/"
              onClick={logoutAndToggleMenu}
            >
              Log Out
            </Link>
          </li>
          :
          <li>
            <Link
              className={`nav-link ${styles.loginlink}`}
              to="/"
              onClick={toggleMenu}
            >Log In</Link>
          </li>
        }
        <li><button onClick={() => console.log(loggedIn)}>log usr</button></li>
      </ul>
    </>
  );
};

export default MobileNavMenu;