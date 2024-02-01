import {useEffect, useState, useContext} from "react";
import {Link, useHistory} from "react-router-dom";
import axios from "axios";
import styles from "./Nav.module.css";
import AppContext from "../../context/AppContext";
import {List} from "react-bootstrap-icons";
import MobileNavMenu from "./MobileNavMenu";

const Nav = ({loggedIn, setLoggedIn, noUser}) => {
  const {serverUrl} = useContext(AppContext);

  const history = useHistory();
  const navigate = path => history.push(path);

  const logout = e => {
    e.preventDefault();
    setLoggedIn(noUser);
    navigate("/");
    axios.get(`${serverUrl}/api/logout`, { withCredentials: true })
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
      document.getElementById("mobilebutton").classList=["collapse"];
    }
    else {
      document.getElementById("collapsingmenu").classList = ["collapse"];
      document.getElementById("mobilebutton").classList=[styles.outerMobileMenu];
      try{
        document.getElementById("mobileholder").style.top = `${document.getElementById("navbar1").offsetHeight - 1}px`;
      } catch {}
    }
  };

  useEffect( () => {
    chooseMenuBasedOnSize();
    window.addEventListener("resize", chooseMenuBasedOnSize);
  }, []);

  return (
    <>
      <nav id="navbar1" className={`navbar navbar-expand-md col-12 mb-1 ${styles.bar}`}>
        <h1 className={`mb-auto`}>
          <Link
            to="/"
            className={styles.logo}
            onClick={() => setViewMobileMenu(false)}
          >
            Chess Roulette
          </Link>
        </h1>

        <div id="collapsingmenu" className="ml-auto">
          <ul className="navbar-nav ml-auto">

            {loggedIn.email ?
              <li className="nav-item mx-lg-3 mx-md-1">
                <Link className={`nav-link ${styles.navlink}`} to={"/profile"}>Profile</Link>
              </li>
              :
              <></>
            }

            <li className="nav-item mx-lg-3 mx-md-1">
              <Link className={`nav-link ${styles.navlink}`} to="/games">Games</Link>
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
                <Link className={`nav-link ${styles.loginlink}`} to="/login">Log In</Link>
              </li>
            }
          </ul>
          
        </div>
      </nav>
      <div id="mobilebutton" className={styles.outerMobileMenu}>
        <button
          className={styles.menuIcon}
          onClick={() => setViewMobileMenu(!viewMobileMenu)}
        >
          <List />
        </button>
      </div>
      {viewMobileMenu ?
        <>
          <div
            id="mobileholder"
            className={styles.mobileHolder}
            style={{top: `${document.getElementById("navbar1").offsetHeight - 1}px`}}
            onClick={() => setViewMobileMenu(false)}
          >
            <MobileNavMenu
              loggedIn={loggedIn}
              logout={logout}
              hideMenu={() => setViewMobileMenu(false)}
            />
          </div>
          <div className={styles.shadow}></div>
        </>
        :
        <></>
      }
    </>

  );
}

export default Nav;