import {useState, useEffect} from 'react';
import Axios from 'axios';
import { navigate } from '@reach/router';


const Show = ({id: uId, loggedIn}) => {
    const [user, setUser] = useState(false);

    useEffect(() => {
        if(loggedIn.email){
            Axios.get(`http://localhost:8000/api/users/${uId}`, {withCredentials:true})
            .then(res => setUser(res.data.results))
            .catch(err => console.log(err))
        }
    }, [uId])

    return (
        <div className="card col-4 mx-auto">
            {loggedIn.email?
                <>
                    <div className="card-body">
                        <h2 className="card-title">{user.firstName}</h2>
                        <p className="card-text">{user.lastName}</p>
                    </div>
                    <button className="btn btn-warning mb-2" onClick={() => navigate(`/users/${uId}/edit`)}>Edit</button>
                </>
                :
                <p>You must be logged in to view user profiles.</p>
            }
        </div>
    )
}

export default Show;