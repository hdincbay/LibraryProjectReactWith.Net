import { useEffect, useState } from 'react';
import './User.css';

function User() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    const connectWebSocket = () => {
        const newSocket = new WebSocket('ws://localhost:7276/UserList/');

        newSocket.onopen = () => {
            console.log('WebSocket baðlantýsý açýldý.');
            // Kullanýcý listesini talep eden bir mesaj gönderebilirsiniz
            newSocket.send(JSON.stringify("Hello"));
        };

        newSocket.onmessage = (event) => {
            console.log('Gelen mesaj:', event.data);
            try {
                const data = JSON.parse(event.data);
                if (data) {
                    // Eðer gelen veri bir dizi ise, kullanýcý listesini güncelle
                    if (Array.isArray(data)) {
                        setUsers(data);
                    } else {
                        // Tekil kullanýcý verisi gelirse, mevcut listeyi güncelle
                        setUsers(prevUsers => {
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
            console.log('WebSocket baðlantýsý kapandý. Yeniden deniyor...');
            setError('WebSocket baðlantýsý kapandý. Yeniden deniyor...');
            setTimeout(connectWebSocket, 5000);
        };

        setSocket(newSocket);
    };

    useEffect(() => {
        connectWebSocket();
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

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
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.userId}>
                        <td>{user.userId}</td>
                        <td>{user.name}</td>
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
