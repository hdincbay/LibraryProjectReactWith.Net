import { useEffect, useState } from 'react';
import './User.css';
import Config from '../config.json';
import UserCreate from './UserCreate.jsx';
import { Link } from 'react-router-dom';
function User() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState(null);

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

    // Kullanýcý silme iþlemi
    const deleteUser = async (event, userid) => {
        setLoading(true); // Yükleniyor durumunu baþlatýyoruz
        try {
            setAuthToken(authToken);
            var restUrl = Config.restApiUrl;
            // API'ye POST isteði gönderme
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
            setLoading(false); // Yükleniyor durumunu bitiriyoruz
        }
    };

    // Component mount olduðunda WebSocket baðlantýsýný baþlatýyoruz
    useEffect(() => {
        connectWebSocket();
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    // Hata veya kullanýcý listesi durumuna göre içerik gösterme
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
                    <th>#</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.userName}</td>
                        <td>
                            <button className="btn btn-success" onClick={(event) => deleteUser(event, user.id)} disabled={loading}>
                                {loading ? 'Siliniyor...' : 'Sil'}
                            </button>
                            
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div>
            <Link to="/UserCreate" className="nav-link">
                <div className="btn btn-outline-success mx-2">User Create</div>
            </Link>
            <h1 id="tableLabel">User List</h1>
            {contents}
        </div>
    );
}

export default User;
