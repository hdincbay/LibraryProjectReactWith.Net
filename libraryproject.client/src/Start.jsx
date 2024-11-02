import { useEffect, useState } from 'react';
import './Start.css';

function Start() {
    const [authors, setAuthors] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    const connectWebSocket = () => {
        const newSocket = new WebSocket('ws://localhost:7276/AuthorList/');

        newSocket.onopen = () => {
            console.log('WebSocket ba�lant�s� a��ld�.');
        };

        newSocket.onmessage = (event) => {
            console.log('Gelen mesaj:', event.data);
            try {
                const data = JSON.parse(event.data);

                // E�er gelen veri bir dizi ise, yazar listesini g�ncelle
                if (Array.isArray(data)) {
                    setAuthors(data);
                } else {
                    // Tekil yazar verisi gelirse, mevcut listeyi g�ncelle
                    setAuthors(prevAuthors => {
                        const existingIds = new Set(prevAuthors.map(author => author.authorId));
                        return [...prevAuthors, data].filter(author => !existingIds.has(author.authorId));
                    });
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
            console.log('WebSocket ba�lant�s� kapand�. Yeniden deniyor...');
            setError('WebSocket ba�lant�s� kapand�. Yeniden deniyor...');
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
        <p><em>Loading...</em></p>
    ) : (
        <table className="table table-striped" aria-labelledby="tableLabel">
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
