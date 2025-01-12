import { useEffect, useState } from 'react';
import './Book.css';
import Config from '../config.json';
import { Link } from 'react-router-dom';
import BookCreate from './BookCreate.jsx';
function Book() {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState(null);
    const authTokenVal = localStorage.getItem('authToken');
    const connectWebSocket = () => {
        var webSocketServerUrl = Config.webSocketUrl;
        const newSocket = new WebSocket(`${webSocketServerUrl}/BookList/`);

        newSocket.onopen = () => {
            setAuthToken(authTokenVal);
            if (authTokenVal) {
                newSocket.send(JSON.stringify({ authToken: authTokenVal + '_book' }));
            }
        };

        newSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data != null && data != [] && data != "") {
                    if (Array.isArray(data)) {
                        setBooks(data);
                    } else {
                        setBooks(prevBooks => {
                            const existingIds = new Set(prevBooks.map(book => book.bookId));
                            return [...prevBooks, data].filter(book => !existingIds.has(book.bookId));
                        });
                    }
                }
            } catch (e) {
                setError('Veri isleme hatasi.');
            }
        };

        newSocket.onerror = (error) => {
            setError('WebSocket baðlantý hatasý. Yeniden deniyor...');
        };

        newSocket.onclose = () => {
            setError('WebSocket baglantisi kapandi. Yeniden deniyor...');
            setTimeout(connectWebSocket, 5000);
        };

        setSocket(newSocket);
    };
    const deleteBook = async (event, bookid) => {
        setLoading(true); // Yükleniyor durumunu baþlatýyoruz
        try {
            setAuthToken(authToken);
            var restUrl = Config.restApiUrl;
            // API'ye POST isteði gönderme
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
        connectWebSocket();
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    const contents = error ? (
        <p><em>{error}</em></p>
    ) : books.length === 0 ? (
        <p><em>Author Undefined...</em></p>
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
                {books.map(book => (
                    <tr key={book.bookId}>
                        <td>{book.bookId}</td>
                        <td>{book.name}</td>
                        <td>
                            <button className="btn btn-success" onClick={(event) => deleteBook(event, book.bookId)} disabled={loading}>
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
            <Link to="/BookCreate" className="nav-link">
                <div className="btn btn-outline-success mx-2">Book Create</div>
            </Link>
            <h1 id="tableLabel">Book List</h1>
            {contents}

        </div>
    );
}

export default Book;
