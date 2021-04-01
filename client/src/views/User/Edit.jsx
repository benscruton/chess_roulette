import UserForm from '../../components/User/UserForm';
import ChangePassword from "../../components/User/ChangePassword";
import { navigate } from '@reach/router';
import {useState, useEffect} from 'react';
import Axios from 'axios';

const Edit = props => {
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

    useEffect(() => {
        Axios.get(`http://localhost:8000/api/users/${props.id}`)
            .then(res => setUser(res.data.results[0]))
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
        })
    }

    const handleSubmit = e => {
        e.preventDefault();

        Axios.put(`http://localhost:8000/api/users/${props.id}`, user)
        .then(res => navigate('/'))
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
    }

    const showPopup = e => {
        e.preventDefault();
        document.getElementById("changepw").style.display = "block";
    }
    
    const goBack = e => {
        e.preventDefault();
        document.getElementById("changepw").style.display = "none";
    }

    const updatePw = e => {
        e.preventDefault();

        if(pwInputs.oldpw !== user.password){
            return (setPwErrors({
                oldpw: "Password incorrect",
                newpw: false,
                confirmpw: false
            }));
        }
        if(pwInputs.newpw.length < 8){
            return (setPwErrors({
                oldpw: false,
                newpw: "Password must be at least 8 characters",
                confirmpw: false

            }));
        }
        if(pwInputs.newpw !== pwInputs.confirmpw){
            return (setPwErrors({
                oldpw: false,
                newpw: false,
                confirmpw: "Passwords must match!"
            }));
        }

        Axios.put(`http://localhost:8000/api/users/${props.id}`, {password: pwInputs.newpw})
            .then( () => navigate(`/users/show/${props.id}`))
            .catch(err => {
                console.log(err.response.data.errors);
                setErrors(err.response.data.errors)
            });
    }

    return(
        <>
            {
                user?
                <>
                    <UserForm 
                        inputs = {user}
                        title = "Edit User"
                        submitValue = "Edit"
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
                <h2>Loading....</h2>
            }   
        </>
    )
}

export default Edit;