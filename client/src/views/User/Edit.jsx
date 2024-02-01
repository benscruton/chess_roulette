import UserForm from '../../components/User/UserForm';
import ChangePassword from "../../components/User/ChangePassword";
import {useState, useEffect, useContext} from 'react';
import {useHistory} from "react-router-dom";
import axios from 'axios';
import AppContext from '../../context/AppContext';

const Edit = ({loggedIn, setLoggedIn}) => {
  const {serverUrl} = useContext(AppContext);
  const history = useHistory();
  const navigate = path => history.push(path);

  useEffect( () => {
    if(!loggedIn.email){
      navigate("/profile");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [showPopup, setShowPopup] = useState(false);

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
  });

  const handleChange = e => {
    setUser({
      ...user,
      [e.target.name] : e.target.value
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    let dataToCheck = {
      email: user.email,
      userId: loggedIn._id
    };
    axios.post(`${serverUrl}/api/checkifexists`, dataToCheck)
      .then( rsp => {
        console.log(rsp.data);
        if(rsp.data.unavailable.email){
          setErrors({...errors,
            email: {message: "This email address is already taken."}
          });
        } else {
          axios.put(`${serverUrl}/api/users/${loggedIn._id}`, user, {withCredentials:true})
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
  };

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
  };

  const togglePopup = e => {
    e.preventDefault();
    setPwInputs(initialPwData);
    setPwErrors(initialPwData);
    setShowPopup(!showPopup);
    setChangedPW("");
  };

  const updatePw = e => {
    e.preventDefault();
    if(pwInputs.newpw !== pwInputs.confirmpw){
      setPwErrors({
        ...pwErrors,
        confirmpw: "Passwords must match!"
      });
      return;
    }
    // check oldpassword against bcrypt hash using axios call
    axios.post(`${serverUrl}/api/checkpassword`, {
        _id: loggedIn._id,
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
        setShowPopup(false);
      }
      else {
        setPwErrors({...initialPwData,
          [rsp.data.category]: rsp.data.error
        });
      }
    })
    .catch(err => console.error({errors: err}));
  };

  const fields = {
    firstName: true,
    lastName: true,
    email: true,
    editingButtons: true
  };

  return(
    <>
      <p className="text-success">{changedPW}</p>
      <div className="col-10 mx-auto">
        <UserForm 
          inputs = {user}
          title = "Edit User"
          submitValue = "Update"
          handleInputChange = {handleChange}
          handleSubmit = {handleSubmit}
          errors = {errors}
          showFields = {fields}
          specialTitles = {{}}
          togglePopup = {togglePopup}
        /> 
      </div>
      {showPopup ?
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
    </>
  );
}

export default Edit;