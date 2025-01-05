import { useEffect, useState } from 'react';
import './Author.css';

function Author() {
    const [authors, setAuthors] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState(null);

    const authTokenVal = localStorage.getItem('authToken');
    const connectWebSocket = () => {
        const newSocket = new WebSocket('ws://localhost:7276/AuthorList/');

        newSocket.onopen = () => {
            setAuthToken(authTokenVal);
            if (authTokenVal) {
                newSocket.send(JSON.stringify({ authToken: authTokenVal + '_author' }));
            }
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
                setError('Veri isleme hatasi.');
            }
        };

        newSocket.onerror = (error) => {
            setError('WebSocket baglanti hatasi. Yeniden deniyor...');
        };

        newSocket.onclose = () => {
            setError('WebSocket baglantisi kapandi. Yeniden deniyor...');
            setTimeout(connectWebSocket, 5000);
        };

        setSocket(newSocket);
    };
    const deleteUser = async (event, authorid) => {
        setLoading(true); // Yükleniyor durumunu baþlatýyoruz
        try {
            setAuthToken(authToken);
            // API'ye POST isteði gönderme
            const response = await fetch(`https://localhost:7275/api/Author/Delete/${authorid}`, {
                method: 'DELETE',
                body: JSON.stringify({
                    authToken: authTokenVal + '_author'
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
                    <th>#</th>
                </tr>
            </thead>
            <tbody>
                {authors.map(author => (
                    <tr key={author.authorId}>
                        <td>{author.authorId}</td>
                        <td>{author.name}</td>
                        <td>
                            <button className="btn btn-success" onClick={(event) => deleteUser(event, author.authorId)} disabled={loading}>
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
            <h1 id="tableLabel">Author List</h1>
            {contents}
        </div>
    );
}

export default Author;
