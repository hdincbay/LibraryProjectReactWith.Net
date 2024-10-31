import { useEffect, useState } from 'react';
import './Start.css';

function Start() {
    const [forecasts, setForecasts] = useState([]);
    const [error, setError] = useState(null); // Hata durumu i�in ekleme

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:7276/'); // WebSocket sunucu adresi

        socket.onopen = () => {
            console.log('WebSocket ba�lant�s� a��ld�.');
        };

        socket.onmessage = (event) => {
            console.log('Gelen mesaj:', event.data); // Mesaj� kontrol et
            try {
                const data = JSON.parse(event.data);
                setForecasts(data); // Veriyi state'e g�ncelle
            } catch (e) {
                console.error('JSON parse hatas�:', e);
                setError('Veri i�leme hatas�.');
            }
        };

        socket.onclose = () => {
            console.log('WebSocket ba�lant�s� kapand�.');
        };

        // Temizleme i�lemi
        return () => {
            socket.close();
        };
    }, []);

    // ��eri�i belirle
    const contents = error
        ? <p><em>{error}</em></p> // Hata mesaj� g�ster
        : forecasts.length === 0
            ? <p><em>Loading...</em></p>
            : <table className="table table-striped" aria-labelledby="tableLabel">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {forecasts.map(forecast =>
                        <tr key={forecast.authorId}>
                            <td>{forecast.authorId}</td>
                            <td>{forecast.name}</td>
                        </tr>
                    )}
                </tbody>
            </table>;

    return (
        <div>
            <h1 id="tableLabel">Author List</h1>
            {contents}
        </div>
    );
}

export default Start;
