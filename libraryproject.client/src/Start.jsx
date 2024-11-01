import { useEffect, useState } from 'react';
import './Start.css';

function Start() {
    const [forecasts, setForecasts] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

    const connectWebSocket = () => {
        const newSocket = new WebSocket('ws://localhost:7276/');

        newSocket.onopen = () => {
            console.log('WebSocket ba�lant�s� a��ld�.');
        };

        newSocket.onmessage = (event) => {
            console.log('Gelen mesaj:', event.data);
            try {
                const data = JSON.parse(event.data);
                // E�er gelen veri bir dizi ise, do�rudan setForecasts ile g�ncelle
                if (Array.isArray(data)) {
                    setForecasts(prevForecasts => [...prevForecasts, ...data]);
                } else {
                    setForecasts(prevForecasts => [...prevForecasts, data]);
                }
            } catch (e) {
                console.error('JSON parse hatas�:', e);
                setError('Veri i�leme hatas�.');
            }
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket hatas�:', error);
            setError('WebSocket ba�lant� hatas�. Yeniden deniyor...');
            // Yeniden ba�lanmay� dene
            setTimeout(connectWebSocket, 5000);
        };

        newSocket.onclose = () => {
            console.log('WebSocket ba�lant�s� kapand�. Yeniden deniyor...');
            // Yeniden ba�lanmay� dene
            setError('WebSocket ba�lant�s� kapand�. Yeniden deniyor...');
            setTimeout(connectWebSocket, 5000);
        };

        setSocket(newSocket);
    };

    useEffect(() => {
        connectWebSocket();

        // Temizleme i�lemi
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, []);

    const contents = error ? (
        <p><em>{error}</em></p>
    ) : forecasts.length === 0 ? (
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
                {forecasts.map(forecast => (
                    <tr key={forecast.authorId}>
                        <td>{forecast.authorId}</td>
                        <td>{forecast.name}</td>
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
