import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Author.css';
import Config from '../../config.json';
import { Link } from 'react-router-dom';
function Author() {
    const navigate = useNavigate();
    const [authors, setAuthors] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
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
                        <td>{author.name + ' ' + author.surname}</td>
                        <td>
                            <div className="col-md-4 offset-md-4" style={{ display: 'flex', flexDirection: 'column' }}>
                                <Link
                                    className="btn btn-primary"
                                    to={`/AuthorUpdate/${author.authorId}`}
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
                                    onClick={(event) => deleteUser(event, author.authorId)}
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
                <Link to="/AuthorCreate" className="nav-link">
                    <div className="btn btn-outline-success mx-2"><i className="fa-solid fa-plus"></i> Author Create</div>
                </Link>
            </div>
            <h1 id="tableLabel">Author List</h1>
            {contents}
        </div>
    );
}

export default Author;
