import UserForm from '../../components/User/UserForm';
import ChangePassword from "../../components/User/ChangePassword";
import { navigate } from '@reach/router';
import {useState, useEffect} from 'react';
import Axios from 'axios';

const Edit = props => {
    const [loggedIn, setLoggedIn] = useState(JSON.parse(localStorage.getItem("user")) || {
        firstName: "No One",
        lastName: "LoggedIn"
    });

    const [user, setUser] = useState(false);
    const [pwInputs, setPwInputs] = useState({
        oldpw: "",
        newpw: "",
        confirmpw: ""
    });
    const [pwErrors, setPwErrors] = useState({
        oldpw: false,
        newpw: false,
        confirmpw: false
    });
    const [changedPW, setChangedPW] = useState("");

    useEffect(() => {
        Axios.get(`http://localhost:8000/api/users/${props.id}`, {withCredentials:true})
            .then(res => setUser(res.data.results))
            .catch(err => console.log(err))
    }, [props])

    const [errors, setErrors] = useState({
        firstName: "",
        lastName: "",
        userName: "",
        email: "",
        password: "",
        confirmPassword: ""
    })

    const handleChange = e => {
        setUser({
            ...user,
            [e.target.name] : e.target.value
        });
    }

    const handleSubmit = e => {
        e.preventDefault();
        
        Axios.put(`http://localhost:8000/api/users/${props.id}`, user, {withCredentials:true})
        .then(res => navigate(`/users/${props.id}`))
        .catch(err => {
            console.log(err.response.data.errors);
            setErrors(err.response.data.errors)
        })
    }

    const handlepwInputs = e => {
        setPwInputs({
            ...pwInputs,
            [e.target.name]: e.target.value
        });
        if(e.target.name === "oldpw"){
            setPwErrors({...pwErrors,
                oldpw: false
            });
        }
    }

    const showPopup = e => {
        e.preventDefault();
        document.getElementById("changepw").style.display = "block";
    }
    
    const goBack = e => {
        e.preventDefault();
        document.getElementById("changepw").style.display = "none";
        setPwInputs({
            oldpw: "",
            newpw: "",
            confirmpw: ""
        });
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
        Axios.post(
                'http://localhost:8000/api/checkpassword', 
                {
                    email: loggedIn.email,
                    password: pwInputs.oldpw,
                    newPassword: pwInputs.newpw,
                    confirmPassword: pwInputs.confirmpw
                },
                {withCredentials:true}
            ).then(rsp => {
                if (rsp.data.msg) {
                    setChangedPW(rsp.data.msg);
                    setPwInputs({
                        oldpw: "",
                        newpw: "",
                        confirmpw: ""
                    });
                    setPwErrors({
                        oldpw: false,
                        newpw: false,
                        confirmpw: false
                    })
                    document.getElementById("changepw").style.display = "none";
                }
                else {
                    setPwErrors({
                        oldpw: "Incorrect password.",
                        newpw: false,
                        confirmpw: false
                    })
                }
            })
            .catch(err => console.error({errors: err}));
    }

    return(
        <>
            {
                user._id === loggedIn._id?
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
                        showPopup = {showPopup}
                    /> 
                    <div id="changepw" style={{display: "none"}}>
                        <ChangePassword
                            handleChange = {handlepwInputs}
                            inputs = {pwInputs}
                            goBack = {goBack}
                            handleSubmit = {updatePw}
                            errors = {pwErrors}
                        />
                    </div>
                </>    
                :
                <p>Loading...</p>
            }   
        </>
    )
}

export default Edit;