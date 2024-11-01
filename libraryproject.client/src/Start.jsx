import { useEffect, useState } from 'react';
import './Start.css';

function Start() {
    const [authors, setAuthors] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    const connectWebSocket = () => {
        const newSocket = new WebSocket('ws://localhost:7276/AuthorList/');

        newSocket.onopen = () => {
            console.log('WebSocket baðlantýsý açýldý.');
        };

        newSocket.onmessage = (event) => {
            console.log('Gelen mesaj:', event.data);
            try {
                const data = JSON.parse(event.data);
                setAuthors(prevAuthors => {
                    const existingIds = new Set(prevAuthors.map(author => author.authorId));
                    const newAuthors = Array.isArray(data) ? data : [data];

                    // Yeni yazarlarý mevcut listeden filtreleyerek güncelle
                    return [...prevAuthors, ...newAuthors.filter(author => !existingIds.has(author.authorId))];
                });
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
            setTimeout(connectWebSocket, 5000); // Baðlantý kapandýðýnda yeniden baðlanmayý dene
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
    }, []); // Boþ baðýmlýlýk dizisi ile yalnýzca ilk render'da baðlanýr

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
