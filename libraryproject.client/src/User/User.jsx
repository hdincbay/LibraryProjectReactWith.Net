import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './User.css';
import Config from '../../config.json';
import { Link } from 'react-router-dom';
function User() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    
    const authTokenVal = localStorage.getItem('authToken');
    const connectWebSocket = () => {
        var webSocketServerUrl = Config.webSocketUrl;
        const newSocket = new WebSocket(`${webSocketServerUrl}/UserList/`);

        newSocket.onopen = async () => {

            setAuthToken(authTokenVal);
            if (authTokenVal) {
                newSocket.send(JSON.stringify({ authToken: authTokenVal + '_user' }));
            }
        };

        newSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data) {
                    if (Array.isArray(data)) {
                        setUsers(data);
                    } else {
                        setUsers((prevUsers) => {
                            const existingIds = new Set(prevUsers.map(user => user.userId));
                            return [...prevUsers, data].filter(user => !existingIds.has(user.userId));
                        });
                    }
                }
            } catch (e) {
                setError('Veri iþleme hatasý.');
            }
        };

        newSocket.onerror = (error) => {
            setError('WebSocket baðlantý hatasý. Yeniden deniyor...');
        };

        newSocket.onclose = () => {
            setError('WebSocket baglantisi kapandi. Yeniden deniyor...');
            setTimeout(connectWebSocket, 5000);
        };

        setSocket(newSocket);
    };

    const deleteUser = async (event, userid) => {
        setLoading(true);
        try {
            setAuthToken(authToken);
            var restUrl = Config.restApiUrl;
            const response = await fetch(`${restUrl}/api/User/Delete/${userid}`, {
                method: 'DELETE',
                body: JSON.stringify({
                    authToken: authTokenVal + '_user'
                }),
            });
            const textResponse = await response.text();

            if (!response.ok) {
                throw new Error(textResponse);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
            navigate('/Login');
        }
        connectWebSocket();
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [navigate]);
    if (!isLoggedIn) {
        return null;
    }

    const contents = error ? (
        <p><em>{error}</em></p>
    ) : users.length === 0 ? (
        <p><em>User Undefined...</em></p>
        ) : (

        <table className="table" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>#</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : ''}</td>
                        <td>{user.userName}</td>
                        <td>{user.email}</td>
                        <td>
                            <div className="col-md-8 offset-md-2" style={{ display: 'flex', flexDirection: 'column' }}>
                                <Link
                                    className="btn btn-primary"
                                    to={`/UserUpdate/${user.userId}`}
                                    style={{
                                        height: '2.5rem', // Ayný yükseklik
                                        display: 'flex',  // Flexbox
                                        alignItems: 'center', // Ýçeriði dikeyde ortala
                                        justifyContent: 'center', // Ýçeriði yatayda ortala
                                        padding: '0 1rem' // Buton içeriði için sað ve sol padding
                                    }}
                                >
                                    <i className="fa-solid fa-pen-nib"></i>&nbsp;Update
                                </Link>
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={(event) => deleteUser(event, user.userId)}
                                    disabled={loading}
                                    style={{
                                        height: '2.5rem', // Ayný yükseklik
                                        display: 'flex',  // Flexbox
                                        alignItems: 'center', // Ýçeriði dikeyde ortala
                                        justifyContent: 'center', // Ýçeriði yatayda ortala
                                        padding: '0 1rem' // Buton içeriði için sað ve sol padding
                                    }}
                                >
                                    <i className="fa fa-trash"></i>&nbsp;{loading ? 'Removed...' : 'Remove'}
                                </button>
                            </div>
                            
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div>
            <div className="d-flex justify-content-end">
                <Link to="/UserCreate" className="nav-link">
                    <div className="btn btn-outline-success mx-2"><i className="fa-solid fa-plus"></i> User Create</div>
                </Link>
            </div>
            <h1 id="tableLabel">User List</h1>
            {contents}
        </div>
    );
}

export default User;
