import { navigate } from '@reach/router';

const Show = ({id, loggedIn}) => {

  return (
    <div className="card col-lg-4 col-md-6 col-sm-10 mx-auto">
      {loggedIn.email?
        <>
          <div className="card-body">
            <h2 className="card-title">{loggedIn.firstName}</h2>
            <p className="card-text">{loggedIn.lastName}</p>
          </div>
          <button className="btn btn-warning mb-2" onClick={() => navigate("/profile/edit")}>Edit</button>
        </>
        :
        <p>You must be logged in to view user profiles.</p>
      }
    </div>
  );
}

export default Show;