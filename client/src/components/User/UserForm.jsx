import {navigate} from '@reach/router'

const UserForm = ({inputs, handleInputChange, handleSubmit, title, submitValue, errors, showFields, specialTitles, togglePopup}) => {
  const handleCancel = (e) => {
    e.preventDefault();
    navigate("/profile");
  }

  return(
    <form onSubmit={handleSubmit}>
      <h2 className="text-center">{title}</h2>

      {showFields.firstName? 
        <div className="form-group">
          <label htmlFor="firstName">
            {specialTitles.firstName || "First Name:"}
          </label>
          <input 
            type="text" 
            name="firstName" 
            className="form-control"
            onChange={handleInputChange}
            value={inputs.firstName}
          />
          <span className="text-danger">
            {errors.firstName ? errors.firstName.message : ""}
          </span>
        </div>
        :
        <></>
      }
      
      {showFields.lastName? 
        <div className="form-group">
          <label htmlFor="lastName">
            {specialTitles.lastName || "Last Name:"}
          </label>
          <input 
            type="text" 
            name="lastName" 
            className="form-control"
            onChange={handleInputChange}
            value={inputs.lastName}
          />
          <span className="text-danger">
            {errors.lastName ? errors.lastName.message : ""}
          </span>
        </div>
        :
        <></>
      }
      
      {showFields.userName?
        <div className="form-group">
          <label htmlFor="userName">
            {specialTitles.userName || "Username:"}
          </label>
          <input 
            type="text" 
            name="userName" 
            className="form-control"
            onChange={handleInputChange}
            value={inputs.userName}
          />
          <span className="text-danger">
            {errors.userName ? errors.userName.message : ""}
          </span>
        </div>
        :
        <></>
      }
      
      {showFields.email?
        <div className="form-group">
          <label htmlFor="email">
            {specialTitles.email || "Email:"}
          </label>
          <input 
            type="text" 
            name="email" 
            className="form-control"
            onChange={handleInputChange}
            value={inputs.email}
          />
          <span className="text-danger">
            {errors.email ? errors.email.message : ""}
          </span>
        </div>
        :
        <></>
      }

      {showFields.password?
        <div className="form-group">
          <label htmlFor="password">
            {specialTitles.password || "Password:"}
          </label>
          <input 
            type="password" 
            name="password" 
            className="form-control"
            onChange={handleInputChange}
            value={inputs.password}
          />
          <span className="text-danger">
            {errors.password ? errors.password.message : ""}
          </span>
        </div>
        :
        <></>
      }
        
      {showFields.confirmPassword?
        <div className="form-group">
          <label htmlFor="confirmPassword">
            {specialTitles.confirmPassword || "Confirm Password:"}
          </label>
          <input 
            type="password" 
            name="confirmPassword" 
            className="form-control"
            onChange={handleInputChange}
            value={inputs.confirmPassword}
          />
          <span className="text-danger">
            {inputs.password !== inputs.confirmPassword? "Passwords must match!" : ""}
          </span>
        </div>
        :
        <></>
      }
      
      <button type="submit" className="btn btn-success mx-1">{submitValue}</button>
      {showFields.editingButtons?
        <>
          <button
            className="btn btn-info mx-1"
            onClick = {togglePopup}
          >
            Edit Password
          </button> 
          <button
            className="btn btn-warning mx-1"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </>
        :
        <></>
      }
    </form>
  )
}

export default UserForm;