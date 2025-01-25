import { useEffect, useState } from 'react';
import './Author.css';
import Config from '../config.json';
import { Link } from 'react-router-dom';
import AuthorCreate from './AuthorCreate.jsx';
function Author() {
    const [authors, setAuthors] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState(null);

    const authTokenVal = localStorage.getItem('authToken');
    const connectWebSocket = () => {
        var webSocketServerUrl = Config.webSocketUrl;
        const newSocket = new WebSocket(`${webSocketServerUrl}/AuthorList/`);

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
                    if (Array.isArray(data)) {
                        setAuthors(data);
                    } else {
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
        setLoading(true);
        try {
            setAuthToken(authToken);
            var restUrl = Config.restApiUrl;
            const response = await fetch(`${restUrl}/api/Author/Delete/${authorid}`, {
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
            setLoading(false);
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
                    <th>Author ID</th>
                    <th>Name</th>
                    <th>#</th>
                </tr>
            </thead>
            <tbody>
                {authors.map(author => (
                    <tr key={author.authorId}>
                        <td>{author.authorId}</td>
                        <td>{author.name + ' ' + author.surname}</td>
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
        <div style={{ width: '100%', paddingTop: '4rem', paddingLeft: 0, paddingRight: 0 }}>
            <div class="d-flex justify-content-end">
                <Link to="/AuthorCreate" className="nav-link">
                    <div className="btn btn-outline-success mx-2">Author Create</div>
                </Link>
            </div>
            <h1 id="tableLabel">Author List</h1>
            {contents}
        </div>
    );
}

export default Author;
