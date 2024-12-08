import { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    const connectWebSocket = () => {
        const newSocket = new WebSocket('ws://localhost:7276/BookList/');

        newSocket.onopen = () => {
            console.log('WebSocket baglantisi acildi.');
            // Backend'e userId gönderiyoruz
            const userId = 'user123';  // Örneðin, burada 'user123' userId'yi alýyorsunuz
            newSocket.send(JSON.stringify({ type: 'setUserId', userId: userId }));
        };

        newSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data != null && data != [] && data != "") {
                    // Eðer gelen veri bir dizi ise, kitap listesini güncelle
                    if (Array.isArray(data)) {
                        setBooks(data);
                    } else {
                        // Tekil kitap verisi gelirse, mevcut listeyi güncelle
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
            setError('WebSocket baðlantý hatasý. Yeniden deniyor...');
        };

        newSocket.onclose = () => {
            console.log('WebSocket baglantisi kapandi. Yeniden deniyor...');
            setError('WebSocket baglantisi kapandi. Yeniden deniyor...');
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
