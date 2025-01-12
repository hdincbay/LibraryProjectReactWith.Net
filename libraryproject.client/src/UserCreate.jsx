import { useEffect, useState } from 'react';
import './User.css';
import Config from '../config.json';
import { useNavigate } from 'react-router-dom';  // Yönlendirme için kullanýlýyor
function UserCreate() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Component mount olduðunda WebSocket baðlantýsýný baþlatýyoruz
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
            navigate('/Login');
        }
    }, [navigate]);

    if (!isLoggedIn) {
        return null;
    }

    return (
        <div style={{ width: '100%' }}>
            <form>
                <table style={{ width: '100%' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '20%' }}>
                                <th>User Name</th>
                            </td>
                            <td>
                                <input className="form-control"></input>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '20%' }}>
                                <th>Password</th>
                            </td>
                            <td>
                                <input className="form-control"></input>
                            </td>
                        </tr>

                        <tr>
                            <td style={{ width: '20%' }}>
                                <th>Password Confirm</th>
                            </td>
                            <td>
                                <input className="form-control"></input>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '20%' }}>
                            </td>
                            <td>
                                <button className="btn btn-success">Submit</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
        </div>
    );
}

export default UserCreate;
