import {useState, useEffect} from 'react';
import Axios from 'axios';
import { navigate } from '@reach/router';


const Show = ({id, loggedIn}) => {
    const [user, setUser] = useState(false);

    // useEffect(() => {
    //     if(loggedIn.email){
    //         Axios.get(`http://localhost:8000/api/users/${id}`, {withCredentials:true})
    //         .then(res => setUser(res.data.results))
    //         .catch(err => console.log(err))
    //     }
    // }, [id])

    return (
        <div className="card col-4 mx-auto">
            {loggedIn.email?
                <>
                    <div className="card-body">
                        <h2 className="card-title">{loggedIn.firstName}</h2>
                        <p className="card-text">{loggedIn.lastName}</p>
                    </div>
                    <button className="btn btn-warning mb-2" onClick={() => navigate(`/users/${id}/edit`)}>Edit</button>
                </>
                :
                <p>You must be logged in to view user profiles.</p>
            }
        </div>
    )
}

export default Show;