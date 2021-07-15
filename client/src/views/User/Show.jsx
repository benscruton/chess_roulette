import { Link } from 'react-router-dom';

const Show = ({id, loggedIn}) => {

  return (
    <div className="card col-lg-4 col-md-6 col-sm-10 mx-auto">
      {loggedIn.email?
        <>
          <div className="card-body">
            <h2 className="card-title">{loggedIn.firstName}</h2>
            <p className="card-text">{loggedIn.lastName}</p>
          </div>
          <Link className="btn btn-warning mb-2" to="/profile/edit">
            Edit
          </Link>
        </>
        :
        <p>You must be logged in to view user profiles.</p>
      }
    </div>
  );
}

export default Show;