import { useEffect, useState } from 'react';
import './User.css';

function User() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState(null);

    const authTokenVal = localStorage.getItem('authToken');
    // WebSocket ba�lant�s�n� kurma fonksiyonu
    const connectWebSocket = () => {
        const newSocket = new WebSocket('ws://localhost:7276/UserList/');

        newSocket.onopen = async () => {
            console.log('WebSocket baglantisi acildi.');

            // Session ID'yi almak i�in fetchUserHashCode fonksiyonunu �a��r�yoruz
            setAuthToken(authTokenVal);
            if (authTokenVal) {
                newSocket.send(JSON.stringify({ authToken: authTokenVal + '_user' }));
            }
        };

        newSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data) {
                    // E�er gelen veri bir dizi ise, kullan�c� listesini g�ncelle
                    if (Array.isArray(data)) {
                        setUsers(data);
                    } else {
                        // Tekil kullan�c� verisi gelirse, mevcut listeyi g�ncelle
                        setUsers((prevUsers) => {
                            const existingIds = new Set(prevUsers.map(user => user.userId));
                            return [...prevUsers, data].filter(user => !existingIds.has(user.userId));
                        });
                    }
                }
            } catch (e) {
                console.error('JSON parse hatas�:', e);
                setError('Veri i�leme hatas�.');
            }
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket hatas�:', error);
            setError('WebSocket ba�lant� hatas�. Yeniden deniyor...');
        };

        newSocket.onclose = () => {
            console.log('WebSocket baglantisi kapandi. Yeniden deniyor...');
            setError('WebSocket baglantisi kapandi. Yeniden deniyor...');
            setTimeout(connectWebSocket, 5000); // Yeniden ba�lant� kurmaya �al��
        };

        setSocket(newSocket);
    };

    // Kullan�c� silme i�lemi
    const deleteUser = async (event, userid) => {
        setLoading(true); // Y�kleniyor durumunu ba�lat�yoruz
        try {
            setAuthToken(authToken);
            // API'ye POST iste�i g�nderme
            const response = await fetch(`https://localhost:7275/api/User/Delete/${userid}`, {
                method: 'DELETE',
                body: JSON.stringify({
                    authToken: authTokenVal + '_user'
                }),
            });
            const textResponse = await response.text();
            console.log(textResponse);

            if (!response.ok) {
                throw new Error(textResponse);
            }
        } catch (error) {
            console.error('API iste�i ba�ar�s�z:', error);
            setError(error.message);
        } finally {
            setLoading(false); // Y�kleniyor durumunu bitiriyoruz
        }
    };

    // Component mount oldu�unda WebSocket ba�lant�s�n� ba�lat�yoruz
    useEffect(() => {
        connectWebSocket();
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    // Hata veya kullan�c� listesi durumuna g�re i�erik g�sterme
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
            <h1 id="tableLabel">User List</h1>
            {contents}
        </div>
    );
}

export default User;
