import { useEffect, useState } from 'react';
import './Book.css';
import Config from '../../config.json';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Book() {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState(null);
    const [authorName, setAuthorName] = useState('');
    const authTokenVal = localStorage.getItem('authToken');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    function formatDate(dateStr) {
        let date = new Date(dateStr);
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let year = date.getFullYear();
        let hours = String(date.getHours()).padStart(2, '0');
        let minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const getAuthorName = async (authorIdVal) => {
        var restUrl = Config.restApiUrl;
        const response = await fetch(`${restUrl}/api/Author/GetById/${authorIdVal}`, {
            method: 'GET'
        });
        const textResponse = await response.text();
        try {
            const jsonResponse = JSON.parse(textResponse);
            return jsonResponse.name + ' ' + jsonResponse.surname;
        } catch (error) {
            console.error('JSON parse hatasý:', error);
        }
    }
    const connectWebSocket = () => {
        var webSocketServerUrl = Config.webSocketUrl;
        const newSocket = new WebSocket(`${webSocketServerUrl}/BookList/`);

        newSocket.onopen = () => {
            setAuthToken(authTokenVal);
            if (authTokenVal) {
                newSocket.send(JSON.stringify({ authToken: authTokenVal + '_book' }));
            }
        };

        newSocket.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data != null && data != [] && data != "") {
                    if (Array.isArray(data)) {
                        for (let item of data) {
                            item.authorId = await getAuthorName(item.authorId);
                            item.createdDate = formatDate(item.createdDate);
                        }
                        setBooks(data);
                    } else {
                        setBooks(prevBooks => {
                            const existingIds = new Set(prevBooks.map(book => book.bookId));
                            return [...prevBooks, data].filter(book => !existingIds.has(book.bookId));
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
            setError('WebSocket baðlantýsý kapandý. Yeniden deniyor...');
            setTimeout(connectWebSocket, 5000);
        };

        setSocket(newSocket);
    };

    const deleteBook = async (event, bookid) => {
        setLoading(true);
        try {
            setAuthToken(authToken);
            var restUrl = Config.restApiUrl;
            const response = await fetch(`${restUrl}/api/Book/Delete/${bookid}`, {
                method: 'DELETE',
                body: JSON.stringify({
                    authToken: authTokenVal + '_book'
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
    ) : books.length === 0 ? (
        <p><em>Author Undefined...</em></p>
    ) : (
        <table className="table" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Created Date</th>
                    <th>Serial Number</th>
                    <th>Available</th>
                    <th>Name</th>
                    <th>Author Name</th>
                    <th>#</th>
                </tr>
            </thead>
            <tbody>
                {books.map(book => (
                    <tr key={book.bookId}>
                        <td>{book.bookId}</td>
                        <td>{book.createdDate}</td>
                        <td>{book.serialNumber}</td>
                        <td>{book.available.toString()}</td>
                        <td>{book.name}</td>
                        <td>{book.authorId}</td>
                        <td>
                            <button className="btn btn-outline-danger" onClick={(event) => deleteBook(event, book.bookId)} disabled={loading}>
                                <i className="fa fa-trash"></i> {loading ? 'Removed...' : 'Remove'}
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div style={{ width: '100%', paddingTop: '4rem', paddingLeft: 0, paddingRight: 0 }}>
            <div className="d-flex justify-content-end">
                <Link to="/BookCreate" className="nav-link">
                    <div className="btn btn-outline-success mx-2"><i className="fa-solid fa-plus"></i> Book Create</div>
                </Link>
            </div>
            <h1 id="tableLabel">Book List</h1>
            {contents}
        </div>
    );
}

export default Book;
