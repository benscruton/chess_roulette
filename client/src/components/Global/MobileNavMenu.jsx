import React from "react";
import {Link} from "@reach/router";
import styles from "./MobileNavMenu.module.css";

const MobileNavMenu = ({loggedIn, logout, hideMenu}) => {

  const logoutAndToggleMenu = e => {
    e.preventDefault();
    logout(e);
    hideMenu();
  }

  return (
    <>
      <ul className={`navbar-nav ${styles.block}`}>
        {loggedIn.email ?
          <li>
            <Link
              className={`nav-link ${styles.navlink}`}
              to={"/profile"}
              onClick={hideMenu}
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
            onClick={hideMenu}
          >
            All Games
          </Link>
        </li>

        <li>
          <Link
            className={`nav-link ${styles.navlink}`}
            to="/games/new"
            onClick={hideMenu}
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
              onClick={hideMenu}
            >Log In</Link>
          </li>
        }
      </ul>
    </>
  );
};

export default MobileNavMenu;