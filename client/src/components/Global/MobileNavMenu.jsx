import React from "react";
import {Link} from "@reach/router";
import styles from "./MobileNavMenu.module.css";

const MobileNavMenu = ({loggedIn, logout}) => {

    return (
        <ul className="navbar-nav ml-auto">

            {loggedIn.email ?
              <li className="nav-item mx-lg-3 mx-md-1">
                <Link className={`nav-link ${styles.navlink}`} to={`/users/${loggedIn._id}`}>Profile</Link>
              </li>
              :
              <></>
            }

            <li className="nav-item mx-lg-3 mx-md-1">
              <Link className={`nav-link ${styles.navlink}`} to="/games">All Games</Link>
            </li>

            <li className="nav-item mx-lg-3 mx-md-1">
              <Link className={`nav-link ${styles.navlink}`} to="/games/new">New Game</Link>
            </li>

            {loggedIn.email ?
              <li className="nav-item mx-lg-3 mx-md-1">
                <a className={`nav-link ${styles.logoutlink}`} href="/logout" onClick={logout}>Log Out</a>
              </li>
              :
              <li className="nav-item mx-lg-3 mx-md-1">
                <Link className={`nav-link ${styles.loginlink}`} to="/">Log In</Link>
              </li>
            }
          </ul>
    );
};

export default MobileNavMenu;