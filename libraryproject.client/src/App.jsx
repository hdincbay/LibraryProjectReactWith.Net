import { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState(null);
    const authTokenVal = localStorage.getItem('authToken');
    const connectWebSocket = () => {
        const newSocket = new WebSocket('ws://localhost:7276/BookList/');

        newSocket.onopen = () => {
            console.log('WebSocket baglantisi acildi.');
            setAuthToken(authTokenVal);
            if (authTokenVal) {
                newSocket.send(JSON.stringify({ authToken: authTokenVal + '_book' }));
            }
        };

        newSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data != null && data != [] && data != "") {
                    // E�er gelen veri bir dizi ise, kitap listesini g�ncelle
                    if (Array.isArray(data)) {
                        setBooks(data);
                    } else {
                        // Tekil kitap verisi gelirse, mevcut listeyi g�ncelle
                        setBooks(prevBooks => {
                            const existingIds = new Set(prevBooks.map(book => book.bookId));
                            return [...prevBooks, data].filter(book => !existingIds.has(book.bookId));
                        });
                    }
                }
            } catch (e) {
                console.error('JSON parse hatasi:', e);
                setError('Veri isleme hatasi.');
            }
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket hatasi:', error);
            setError('WebSocket ba�lant� hatas�. Yeniden deniyor...');
        };

        newSocket.onclose = () => {
            console.log('WebSocket baglantisi kapandi. Yeniden deniyor...');
            setError('WebSocket baglantisi kapandi. Yeniden deniyor...');
            setTimeout(connectWebSocket, 5000);
        };

        setSocket(newSocket);
    };
    const deleteBook = async (event, bookid) => {
        setLoading(true); // Y�kleniyor durumunu ba�lat�yoruz
        try {
            setAuthToken(authToken);
            // API'ye POST iste�i g�nderme
            const response = await fetch(`https://localhost:7275/api/Book/Delete/${bookid}`, {
                method: 'DELETE',
                body: JSON.stringify({
                    authToken: authTokenVal + '_book'
                }),
            });
            const textResponse = await response.text();
            console.log(textResponse);

            if (!response.ok) {
                throw new Error(textResponse);
            }
        } catch (error) {
            console.error('API iste�i ba�ar�s�z:', error);
            setError(error.message);
        } finally {
            setLoading(false); // Y�kleniyor durumunu bitiriyoruz
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
            <h1 id="tableLabel">Book List</h1>
            {contents}

        </div>
    );
}

export default App;
