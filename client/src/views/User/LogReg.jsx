import { navigate } from '@reach/router';
import { useState } from 'react';
import Axios from 'axios';
import UserForm from "../../components/User/UserForm";

const LogReg = ({setLoggedIn}) => {
  const initialLog = {
    email : "",
    password : "",
  };
  const initialReg = {
    firstName : "",
    lastName : "",
    userName : "",
    email : "",
    password : "",
    confirmPassword : "",
  };
  
  const [log, setLog] = useState(initialLog);
  const [logErrors, setLogErrors] = useState(initialLog);
  const [reg, setReg] = useState(initialReg);
  const [regErrors, setRegErrors] = useState(initialReg);
  
  const handleRegInputs = (e) => {
    setReg({
      ...reg,
      [e.target.name]: e.target.value
    })
  };

  const logUserIn = user => {
    localStorage.setItem("user", JSON.stringify(user));
    setLoggedIn(user);
    navigate("/games");
  };

  const handleRegister = e => {
    e.preventDefault();
    let dataToCheckForDuplicates = {
      email: reg.email,
      userName: reg.userName,
      userId: false,
    };
    Axios.post("http://localhost:8000/api/checkifexists", dataToCheckForDuplicates)
      .then(rsp => {
        let duplicateError = false;
        let updatedRegErrors = {...initialReg};
        if(rsp.data.unavailable.email){
          duplicateError = true;
          updatedRegErrors.email = {message: "This email address is already taken."};
        }
        if(rsp.data.unavailable.userName){
          duplicateError = true;
          updatedRegErrors.userName = {message: "This username is already taken."};
        }
        if(duplicateError){
          setRegErrors(updatedRegErrors);
          return;
        }
        Axios.post('http://localhost:8000/api/register', reg, {withCredentials:true})
          .then(rsp => {
            if (rsp.data.msg) {
              logUserIn(rsp.data.userLogged);
            } else {
              setRegErrors(rsp.data);
            }
          })
          .catch(err => console.error(err));
      })
      .catch(err => console.error(err));
  };

  const handleLogInputs = e => {
    setLog({...log,
      [e.target.name]: e.target.value
    })
  };

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
      .catch(err => console.error(err));
  };

  const demoLogin = e => {
    e.preventDefault();
    Axios.post("http://localhost:8000/api/demoLogin", {userName: e.target.value}, {withCredentials:true})
      .then(rsp => {
        logUserIn(rsp.data.userLogged);
      });
  };

  const regFields = {
    firstName: true,
    lastName: true,
    userName: true,
    email: true,
    password: true,
    confirmPassword: true
  };

  const logFields = {
    email: true,
    password: true
  };

  return (
    <div className="d-flex justify-content-around flex-wrap">

      <div className="col-lg-4 col-md-5 col-sm-6 col-10">
        <UserForm
          inputs = {log}
          title = "Log In"
          submitValue = "Log In"
          handleInputChange = {handleLogInputs}
          handleSubmit = {handleLogin}
          errors = {logErrors}
          showFields = {logFields}
          specialTitles = {{email: "Username or email:"}}
          togglePopup = {null}
        />

        {/* DEMO USER BOX: */}
        <div className="card bg-dark mb-2 text-light mt-4">
          <div className="card-body">
            <h4 className="card-title">Demo Users:</h4>

            <p>For demonstrational purposes, click either of the buttons below to log in as a preselected demo user.</p>

            <button
              className="btn btn-outline-light btn-info mx-2 my-1"
              onClick={demoLogin}
              value="demo_1"
            >
              User 1
            </button>
            <button
              className="btn btn-outline-light btn-info mx-2 my-1"
              onClick={demoLogin}
              value="demo_2"
            >
              User 2
            </button>
          </div>
          {/* END DEMO USER BOX */}

        </div>
      </div>

      <div className="col-lg-4 col-md-5 col-sm-6 col-10">
        <UserForm
          inputs = {reg}
          title = "Register"
          submitValue = "Register"
          handleInputChange = {handleRegInputs}
          handleSubmit = {handleRegister}
          errors = {regErrors}
          showFields = {regFields}
          specialTitles = {{}}
          togglePopup = {null}
        />
      </div>
    </div>
  );
}

export default LogReg;