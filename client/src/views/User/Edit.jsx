import UserForm from '../../components/User/UserForm';
import ChangePassword from "../../components/User/ChangePassword";
import { navigate } from '@reach/router';
import {useState, useEffect} from 'react';
import Axios from 'axios';

const Edit = ({loggedIn, setLoggedIn}) => {
  useEffect( () => {
    if(!loggedIn.email){
      navigate("/profile");
    }
  }, []);

  const [showPasswordChange, setShowPasswordChange] = useState(false);

  const initialPwData = {
    oldpw: "",
    newpw: "",
    confirmpw: ""
  };

  const [user, setUser] = useState({
    firstName: loggedIn.firstName,
    lastName: loggedIn.lastName,
    email: loggedIn.email,
    _id: loggedIn._id
  });
  const [pwInputs, setPwInputs] = useState(initialPwData);
  const [pwErrors, setPwErrors] = useState(initialPwData);
  const [changedPW, setChangedPW] = useState("");

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: ""
  })

  const handleChange = e => {
    setUser({
      ...user,
      [e.target.name] : e.target.value
    });
  }

  const handleSubmit = e => {
    e.preventDefault();
    let dataToCheck = {
      category: "email",
      value: user.email,
      userId: loggedIn._id
    };
    Axios.post("http://localhost:8000/api/checkifexists", dataToCheck)
      .then( rsp => {
        if(rsp.data.userExists.email){
          setErrors({...errors,
            email: {message: "This email address is already taken."}
          });
        } else {
          Axios.put(`http://localhost:8000/api/users/${loggedIn._id}`, user, {withCredentials:true})
          .then( () => {
            setLoggedIn({...loggedIn,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email
            });
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/profile");
          })
          .catch(err => {
              console.log(err.response.data.errors);
              setErrors(err.response.data.errors)
          });
        }
      })
      .catch(err => console.log(err.response.data.errors));
  }

  const handlepwInputs = e => {
    setPwInputs({
      ...pwInputs,
      [e.target.name]: e.target.value
    });
    if(e.target.name === "oldpw"){
      setPwErrors({...pwErrors,
        oldpw: ""
      });
    }
  }

  const togglePopup = e => {
    e.preventDefault();
    setPwInputs(initialPwData);
    setPwErrors(initialPwData);
    setShowPasswordChange(!showPasswordChange);
    setChangedPW("");
  }

  const updatePw = e => {
    e.preventDefault();
    if(pwInputs.newpw !== pwInputs.confirmpw){
      setPwErrors({
        ...pwErrors,
        confirmpw: "Passwords must match!"
      });
      return;
    }
    // check oldpassword against bcrypt hash using Axios call
    Axios.post('http://localhost:8000/api/checkpassword', {
        email: loggedIn.email,
        password: pwInputs.oldpw,
        newPassword: pwInputs.newpw,
        confirmPassword: pwInputs.confirmpw
      },
      {withCredentials:true}
    ).then(rsp => {
      if(rsp.data.msg){
        setChangedPW(rsp.data.msg);
        setPwInputs(initialPwData);
        setPwErrors(initialPwData)
        setShowPasswordChange(false);
      }
      else {
        setPwErrors({...initialPwData,
          [rsp.data.category]: rsp.data.error
        });
      }
    })
    .catch(err => console.error({errors: err}));
  }

  return(
    <>
      <p className="text-success">{changedPW}</p>
      <UserForm 
        inputs = {user}
        title = "Edit User"
        submitValue = "Update"
        handleInputChange = {handleChange}
        handleSubmit = {handleSubmit}
        errors = {errors}
        editing = {true}
        togglePopup = {togglePopup}
      /> 
      {/* <div id="changepw" style={{display: "none"}}> */}
      {showPasswordChange ?
        <ChangePassword
          handleChange = {handlepwInputs}
          inputs = {pwInputs}
          togglePopup = {togglePopup}
          handleSubmit = {updatePw}
          errors = {pwErrors}
        />
        :
        <></>
      }
      {/* // </div> */}
    </>
  );
}

export default Edit;