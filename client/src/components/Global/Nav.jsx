import React, {useEffect, useState} from "react";
import {Link, navigate} from "@reach/router";
import axios from "axios";
import styles from "./Nav.module.css";
import {List} from "react-bootstrap-icons";
import MobileNavMenu from "./MobileNavMenu";


const Nav = ({loggedIn, setLoggedIn, noUser}) => {

  const logout = e => {
    e.preventDefault();
    setLoggedIn(noUser);
    navigate("/");
    axios.get(`http://localhost:8000/api/logout`, { withCredentials: true })
      .then( () => {
        localStorage.clear();
      })
      .catch(err => console.log(err));
  };


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
    chooseMenuBasedOnSize();
    window.addEventListener("resize", chooseMenuBasedOnSize);
  }, []);

  const toggleMobileMenu = () => {
    setViewMobileMenu(!viewMobileMenu);
  };

  return (
    <>
      <nav className={`navbar navbar-expand-md col-12 mb-1 d-flex ${styles.bar}`}>
        <h1 className={`${styles.logo} mb-auto`}>Chess Roulette</h1>

        <div className="ml-auto">
          <div className="col-md-12 col-sm-0">
            <button
              className={`navbar-toggler ${styles.menuIcon}`}
              onClick={toggleMobileMenu}
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
                  <Link className={`nav-link ${styles.logoutlink}`} to="/" onClick={logout}>
                    Log Out
                  </Link>
                </li>
                :
                <li className="nav-item mx-lg-3 mx-md-1">
                  <Link className={`nav-link ${styles.loginlink}`} to="/">Log In</Link>
                </li>
              }
            </ul>
            
          </div>
        </div>
      </nav>
      {viewMobileMenu ? 
          <MobileNavMenu
            loggedIn={loggedIn}
            logout={logout}
            toggleMenu={toggleMobileMenu}
          />
        :
        <></>
      }
    </>

  );
}

export default Nav;