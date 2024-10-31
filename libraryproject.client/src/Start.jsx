import { useEffect, useState } from 'react';
import './Start.css';

function Start() {
    const [forecasts, setForecasts] = useState([]);
    const [error, setError] = useState(null); // Hata durumu için ekleme

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:7276/'); // WebSocket sunucu adresi

        socket.onopen = () => {
            console.log('WebSocket baðlantýsý açýldý.');
        };

        socket.onmessage = (event) => {
            console.log('Gelen mesaj:', event.data); // Mesajý kontrol et
            try {
                const data = JSON.parse(event.data);
                setForecasts(data); // Veriyi state'e güncelle
            } catch (e) {
                console.error('JSON parse hatasý:', e);
                setError('Veri iþleme hatasý.');
            }
        };

        socket.onclose = () => {
            console.log('WebSocket baðlantýsý kapandý.');
        };

        // Temizleme iþlemi
        return () => {
            socket.close();
        };
    }, []);

    // Ýçeriði belirle
    const contents = error
        ? <p><em>{error}</em></p> // Hata mesajý göster
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
