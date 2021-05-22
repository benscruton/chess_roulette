import React, {useEffect, useState} from "react";
import {Link} from "@reach/router";
import styles from "./Nav.module.css";
import {List} from "react-bootstrap-icons";


const Nav = ({loggedIn, logout}) => {

  const [prevScreenWidth, setPrevScreenWidth] = useState(window.innerWidth);

  const chooseMenuBasedOnSize = () => {
    
    console.log(window);
    console.log(window.innerWidth);
    setPrevScreenWidth(window.innerWidth);


    // if(window.innerWidth < 768 && !isMobileSize){
    //   document.getElementById("collapsingmenu").classList = ["collapse"];
    //   setIsMobileSize(true);
    // }

    // else if(window.innerWidth >= 768 && isMobileSize){
    //   document.getElementById("collapsingmenu").classList = [];
    //   setIsMobileSize(false);
    // }
  };

  useEffect( () => {
    window.addEventListener("resize", chooseMenuBasedOnSize);
  }, []);

  const toggleMenu = (e) => {
    let menu = document.getElementById("collapsingmenu");
    if(menu.classList.contains("collapse")){
      menu.classList = [];
    } else {
      menu.classList = ["collapse"];
    }
  }

  return (
    <nav className={`navbar navbar-expand-md col-12 mb-1 d-flex ${styles.bar}`}>
      <h1 className={`${styles.logo} mb-auto`}>Chess Roulette</h1>

      <div className="ml-auto">
        <div className="col-md-12 col-sm-0">
          <button
            className={`navbar-toggler ${styles.barIcon}`}
            onClick={toggleMenu}
          >
            <List />
          </button>
        </div>
        
        <div id="collapsingmenu">
          <ul className="navbar-nav ml-auto">

            <li className="nav-item mx-lg-3 mx-md-1">
              <Link className={`nav-link ${styles.innerlink}`} to={`/users/${loggedIn._id}`}>Profile</Link>
            </li>

            <li className="nav-item mx-lg-3 mx-md-1">
              <Link className={`nav-link ${styles.innerlink}`} to="/games">All Games</Link>
            </li>

            <li className="nav-item mx-lg-3 mx-md-1">
              <Link className={`nav-link ${styles.innerlink}`} to="/games/new">New Game</Link>
            </li>

            <li className="nav-item mx-lg-3 mx-md-1">
              <a className={`nav-link ${styles.innerlogout}`} href="/logout" onClick={logout}>Log Out</a>
            </li>

          </ul>
        </div>
      </div>
    </nav>

  );
}

export default Nav;