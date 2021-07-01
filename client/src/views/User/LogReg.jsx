import { navigate } from '@reach/router';
import { useState } from 'react';
import Axios from 'axios';
import UserForm from "../../components/User/UserForm";

const LogReg = ({setLoggedIn}) => {
  const initialReg = {
    firstName : "",
    lastName : "",
    userName : "",
    email : "",
    password : "",
    confirmPassword : "",
  }
  
  const [reg, setReg] = useState(initialReg);
  const [regErrors, setRegErrors] = useState(initialReg);
  
  const handleRegInputs = (e) => {
    setReg({
      ...reg,
      [e.target.name]: e.target.value
    })
  }

  const logUserIn = user => {
    localStorage.setItem("user", JSON.stringify(user));
    setLoggedIn(user);
    navigate("profile");
  };

  const handleRegister = e => {
    e.preventDefault();
    Axios.post('http://localhost:8000/api/register', reg, {withCredentials:true})
      .then(rsp => {
        console.log(rsp.data)
        if (rsp.data.msg) {
          logUserIn(rsp.data.userLogged);
        } else {
          setRegErrors(rsp.data);
        }
      })
  };
  
  const initialLog = {
    email : "",
    password : "",
  };
  
  const [log, setLog] = useState(initialLog);
  const [logErrors, setLogErrors] = useState(initialLog);

  const handleLogInputs = e => {
    setLog({...log,
      [e.target.name]: e.target.value
    })
  }

  const handleLogin = e => {
    e.preventDefault();
    Axios.post('http://localhost:8000/api/login', log, {withCredentials:true})
      .then(rsp => {
        if (rsp.data.msg) {
          logUserIn(rsp.data.userLogged);
        } else {
          setLogErrors({
            email: {message: rsp.data.error},
            password: {message: rsp.data.error}
          });
        }
    })
  };

  const demoLogin = e => {
    e.preventDefault();
    Axios.post("http://localhost:8000/api/demoLogin", {userName: e.target.value}, {withCredentials:true})
      .then(rsp => {
        logUserIn(rsp.data.userLogged);
      });
  };

  return (
    <div className="d-flex justify-content-around flex-wrap">
      
      <form className="col-lg-4 col-md-5 col-sm-6 col-10" onSubmit={handleLogin}>
        <h2 className="text-center">Log In</h2>

        <div className="form-group">
          <label htmlFor="email">Username or email:</label>
          <input 
            type="text" 
            name="email"
            className="form-control"
            onChange={handleLogInputs}
            value={log.email}
          />
          <span className="text-danger">
            {logErrors.email ? logErrors.email.message : ""}
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input 
            type="password" 
            name="password"
            className="form-control"
            onChange={handleLogInputs}
            value={log.password}
          />
          <span className="text-danger">
            {/* {logErrors.password ? logErrors.password.message : ""} */}
          </span>
          <input type="submit" value="Login" className="btn btn-dark my-3"/>
        </div>

        {/* DEMO USER BOX: */}
        <div className="card bg-dark mb-2 text-light">
          <div className="card-body">
            <h4 className="card-title">Demo Users:</h4>

            <p>For demonstrational purposes, click either of the buttons below to log in as a preselected demo user.</p>

            <button
              className="btn btn-outline-light btn-info mx-1 my-1"
              onClick={demoLogin}
              value="LieutenantPol"
            >
              User 1
            </button>
            <button
              className="btn btn-outline-light btn-info mx-1 my-1"
              onClick={demoLogin}
              value="YavinBucketGuy"
            >
              User 2
            </button>
          </div>
          {/* END DEMO USER BOX */}

        </div>
      </form>

      <div className="col-lg-4 col-md-5 col-sm-6 col-10">
        <UserForm
          inputs = {reg}
          title = "Register"
          submitValue = "Register"
          handleInputChange = {handleRegInputs}
          handleSubmit = {handleRegister}
          errors = {regErrors}
          editing = {false}
          togglePopup = {null}
        />
      </div>
    </div>
  )
}

export default LogReg;