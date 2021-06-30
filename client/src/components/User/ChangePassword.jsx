import styles from "./ChangePassword.module.css"

const ChangePassword = ({togglePopup, handleChange, handleSubmit, errors, inputs}) => {    
  
  return (
    <div className = {styles.mainPopup}>
      <div className = {styles.innerContainer}>
        <h3 style={{marginBottom: "20px"}}>Change Password:</h3>
        
        <form onSubmit = {handleSubmit}>
          <div className="form-group">
            <label htmlFor="oldpw">Old Password:</label><br />
            <input
              type="password"
              name="oldpw"
              id="oldpw"
              onChange={handleChange}
              value={inputs.oldpw}
            />
            <p className="text-danger">{errors.oldpw}</p>
          </div>

          <div className="form-group">
            <label htmlFor="newpw">New Password:</label><br />
            <input
              type="password"
              name="newpw"
              id="newpw"
              onChange={handleChange}
              value={inputs.newpw}
            />
            <p className="text-danger">{errors.newpw? errors.newpw : ""}</p>
          </div>

          <div className="form-group">
            <label htmlFor="confirmpw">Confirm Password:</label><br />
            <input
              type="password"
              name="confirmpw"
              id="confirmpw"
              onChange = {handleChange}
              value={inputs.confirmpw}
            />
            <p className="text-danger">{errors.confirmpw? errors.confirmpw : ""}</p>
          </div>

          <button
            type="submit"
            className="btn btn-success mb-3 mx-1"
          >
            Change Password
          </button>
          <button 
            className="btn btn-warning mb-3 mx-1"
            onClick = {togglePopup}
          >
            Cancel
          </button>

        </form>
      </div>
    </div>
  );
}

export default ChangePassword;