import { useEffect, useState } from 'react';
import './User.css';

function User() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState(null);

    const authTokenVal = localStorage.getItem('authToken');
    // WebSocket baðlantýsýný kurma fonksiyonu
    const connectWebSocket = () => {
        const newSocket = new WebSocket('ws://localhost:7276/UserList/');

        newSocket.onopen = async () => {
            console.log('WebSocket baglantisi acildi.');

            // Session ID'yi almak için fetchUserHashCode fonksiyonunu çaðýrýyoruz
            setAuthToken(authTokenVal);
            if (authTokenVal) {
                newSocket.send(JSON.stringify({ authToken: authTokenVal + '_user' }));
            }
        };

        newSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data) {
                    // Eðer gelen veri bir dizi ise, kullanýcý listesini güncelle
                    if (Array.isArray(data)) {
                        setUsers(data);
                    } else {
                        // Tekil kullanýcý verisi gelirse, mevcut listeyi güncelle
                        setUsers((prevUsers) => {
                            const existingIds = new Set(prevUsers.map(user => user.userId));
                            return [...prevUsers, data].filter(user => !existingIds.has(user.userId));
                        });
                    }
                }
            } catch (e) {
                console.error('JSON parse hatasý:', e);
                setError('Veri iþleme hatasý.');
            }
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket hatasý:', error);
            setError('WebSocket baðlantý hatasý. Yeniden deniyor...');
        };

        newSocket.onclose = () => {
            console.log('WebSocket baglantisi kapandi. Yeniden deniyor...');
            setError('WebSocket baglantisi kapandi. Yeniden deniyor...');
            setTimeout(connectWebSocket, 5000); // Yeniden baðlantý kurmaya çalýþ
        };

        setSocket(newSocket);
    };

    // Kullanýcý silme iþlemi
    const deleteUser = async (event, userid) => {
        setLoading(true); // Yükleniyor durumunu baþlatýyoruz
        try {
            setAuthToken(authToken);
            // API'ye POST isteði gönderme
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
            console.error('API isteði baþarýsýz:', error);
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
            <h1 id="tableLabel">User List</h1>
            {contents}
        </div>
    );
}

export default User;
