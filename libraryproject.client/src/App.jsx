import { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    const connectWebSocket = () => {
        const newSocket = new WebSocket('ws://localhost:7276/BookList/');

        newSocket.onopen = () => {
            console.log('WebSocket ba�lant�s� a��ld�.');
            // Kitap listesini talep eden bir mesaj g�nderebilirsiniz
            newSocket.send(JSON.stringify("Hello"));
        };

        newSocket.onmessage = (event) => {
            console.log('Gelen mesaj:', event.data);
            try {
                const data = JSON.parse(event.data);

                if (data != null || data != [] || data != "")
                {
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
    ) : books.length === 0 ? (
        <p><em>Author Undefined...</em></p>
    ) : (
        <table className="table" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                </tr>
            </thead>
            <tbody>
                {books.map(book => (
                    <tr key={book.bookId}>
                        <td>{book.bookId}</td>
                        <td>{book.name}</td>
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
