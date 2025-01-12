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
    const [authorName, setAuthorName] = useState('');
    const authTokenVal = localStorage.getItem('authToken');

    // Date formatlama fonksiyonu
    function formatDate(dateStr) {
        let date = new Date(dateStr);
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let year = date.getFullYear();
        let hours = String(date.getHours()).padStart(2, '0');
        let minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    // Yazar ad�n� almak i�in asenkron fonksiyon
    const getAuthorName = async (authorIdVal) => {
        var restUrl = Config.restApiUrl;
        const response = await fetch(`${restUrl}/api/Author/GetById/${authorIdVal}`, {
            method: 'GET'
        });
        const textResponse = await response.text();
        try {
            const jsonResponse = JSON.parse(textResponse);
            return jsonResponse.name + ' ' + jsonResponse.surname; // Yazar ad� burada d�n�l�yor
        } catch (error) {
            console.error('JSON parse hatas�:', error);
        }
    }

    // WebSocket ba�lant�s�
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
                        // Asenkron olarak yazar adlar�n� al�p kitaplara ekle
                        for (let item of data) {
                            item.authorId = await getAuthorName(item.authorId); // Yazar ad�n� al
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
                setError('Veri i�leme hatas�.');
            }
        };

        newSocket.onerror = (error) => {
            setError('WebSocket ba�lant� hatas�. Yeniden deniyor...');
        };

        newSocket.onclose = () => {
            setError('WebSocket ba�lant�s� kapand�. Yeniden deniyor...');
            setTimeout(connectWebSocket, 5000);
        };

        setSocket(newSocket);
    };

    // Kitap silme i�lemi
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
                    <th>Created Date</th>
                    <th>Serial Number</th>
                    <th>Name</th>
                    <th>Available</th>
                    <th>Author Name</th>
                    <th>#</th>
                </tr>
            </thead>
            <tbody>
                {books.map(book => (
                    <tr key={book.bookId}>
                        <td>{book.createdDate}</td>
                        <td>{book.serialNumber}</td>
                        <td>{book.name}</td>
                        <td>{book.available.toString()}</td>
                        <td>{book.authorId}</td>
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
