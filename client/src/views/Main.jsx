import { useState, useEffect } from "react";
import { Link, navigate } from "@reach/router";
import Axios from "axios";

const Main = (props) => {
  const [users, setUsers] = useState(null);
  const [loggedIn, setLoggedIn] = useState(
    JSON.parse(localStorage.getItem("user")) || {
      firstName: "No One",
      lastName: "LoggedIn",
    }
  );

  useEffect(() => {
    Axios.get("http://localhost:8000/api/users", { withCredentials: true })
      .then((res) => setUsers(res.data.results))
      .catch((err) => {
        if (err.response.status === 401) {
          navigate("/");
        }
      });
  }, []);

  const handleDestroyUser = (id) => {
    Axios.delete(`http://localhost:8000/api/users/${id}`, {
      withCredentials: true,
    })
      .then((res) => setUsers(res.data.results))
      .catch((err) => console.log(err));
  };

  const logout = () => {
    Axios.get(`http://localhost:8000/api/logout`, { withCredentials: true })
      .then((res) => {
        localStorage.clear();
        navigate("/");
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <div className="col-12">
        <h4>
          {loggedIn.firstName} {loggedIn.lastName}
        </h4>
        <button className="btn btn-sm btn-danger" onClick={logout}>
          Logout
        </button>
      </div>
      {users ? (
        <table className="col-lg-7 col-md-12 col-sm-12 col-xs-12 border table table-hover mx-auto">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => {
              return (
                <tr key={i}>
                  <td>{user.firstName}</td>
                  <td>
                    {
                      // users ?
                      user._id === loggedIn._id ? (
                        <>
                          <Link
                            className="btn btn-warning"
                            to={`/users/${user._id}/edit`}
                          >
                            Edit
                          </Link>
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              handleDestroyUser(user._id);
                            }}
                          >
                            Delete
                          </button>
                        </>
                      ) : null
                    }
                    <Link
                      to={`/users/${user._id}`}
                      className="btn btn-success"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <h2>Loading...</h2>
      )}
    </div>
  );
};

export default Main;
