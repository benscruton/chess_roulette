import React, {useEffect, useState} from "react";
import {Link} from "@reach/router";
import styles from "./Nav.module.css";
import {List} from "react-bootstrap-icons";
import MobileNavMenu from "./MobileNavMenu";


const Nav = ({loggedIn, logout}) => {
  const [viewMobileMenu, setViewMobileMenu] = useState(false);

  const chooseMenuBasedOnSize = () => {
    if(window.innerWidth >= 768){
      setViewMobileMenu(false);
      document.getElementById("collapsingmenu").classList = [];
    }
    else {
      document.getElementById("collapsingmenu").classList = ["collapse"];
    }
  };

  useEffect( () => {
    window.addEventListener("resize", chooseMenuBasedOnSize);
  }, []);

  return (
    <nav className={`navbar navbar-expand-md col-12 mb-1 d-flex ${styles.bar}`}>
      <h1 className={`${styles.logo} mb-auto`}>Chess Roulette</h1>

      <div className="ml-auto">
        <div className="col-md-12 col-sm-0">
          <button
            className={`navbar-toggler ${styles.barIcon}`}
            onClick={() => setViewMobileMenu(!viewMobileMenu)}
          >
            <List />
          </button>
        </div>
        
        <div id="collapsingmenu">
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
          
        </div>
        {viewMobileMenu ? 
            <MobileNavMenu loggedIn={loggedIn} logout={logout} />
            :
            <></>
          }
      </div>
    </nav>

  );
}

export default Nav;