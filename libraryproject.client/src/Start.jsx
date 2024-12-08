import { useEffect, useState } from 'react';
import './Start.css';

function Start() {
    const [authors, setAuthors] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    const connectWebSocket = () => {
        const newSocket = new WebSocket('ws://localhost:7276/AuthorList/');

        newSocket.onopen = () => {
            console.log('WebSocket baglantisi acildi.');
            const clientName = 'author';
            newSocket.send(JSON.stringify({ clientName: clientName }));
        };

        newSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data != null || data != [] || data != "")
                {
                    // Eðer gelen veri bir dizi ise, yazar listesini güncelle
                    if (Array.isArray(data)) {
                        setAuthors(data);
                    } else {
                        // Tekil yazar verisi gelirse, mevcut listeyi güncelle
                        setAuthors(prevAuthors => {
                            const existingIds = new Set(prevAuthors.map(author => author.authorId));
                            return [...prevAuthors, data].filter(author => !existingIds.has(author.authorId));
                        });
                    }
                }
                
            } catch (e) {
                console.error('JSON parse hatasý:', e);
                setError('Veri isleme hatasi.');
            }
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket hatasi:', error);
            setError('WebSocket baglanti hatasi. Yeniden deniyor...');
        };

        newSocket.onclose = () => {
            console.log('WebSocket baglantisi kapandi. Yeniden deniyor...');
            setError('WebSocket baglantisi kapandi. Yeniden deniyor...');
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
    ) : authors.length === 0 ? (
        <p><em>Book Undefined...</em></p>
    ) : (
        <table className="table" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                </tr>
            </thead>
            <tbody>
                {authors.map(author => (
                    <tr key={author.authorId}>
                        <td>{author.authorId}</td>
                        <td>{author.name}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div>
            <h1 id="tableLabel">Author List</h1>
            {contents}
        </div>
    );
}

export default Start;
