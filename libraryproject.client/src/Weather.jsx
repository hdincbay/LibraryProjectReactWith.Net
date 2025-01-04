import { useEffect, useState } from 'react';
import './Author.css';
import Config from '../config.json';

function Weather() {
    const [weatherData, setWeatherData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isControl, setIsControl] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const apiKey = Config.apiKey; // Config dosyasýndan apiKey'i al
            const weatherFields = Config.weathers;

            try {
                if (navigator.geolocation) {

                    const kelvinToCelsius = (kelvin) => {
                        return kelvin - 273.15; // Kelvin'den Celsius'a dönüþtürme
                    };
                    // Konum alma (Geolocation API)
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });

                    const latitude = position.coords.latitude; // Enlem
                    const longitude = position.coords.longitude; // Boylam

                    console.log(`Enlem: ${latitude}, Boylam: ${longitude}`);
                    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
                    const data = await response.json();

                    console.log(data);  // API yanýtýný kontrol edin

                    if (Array.isArray(data.list)) {
                        setWeatherData(data.list);
                    }

                    setError(false); // Konum baþarýyla alýndý, hata durumu sýfýrlanýr
                    setIsControl(true);
                } else {
                    console.log("Geolocation API tarayýcýnýzda desteklenmiyor.");
                    setError(true); // Konum alýnamadý hatasý
                }
            } catch (error) {
                console.error('API fetch error:', error); // Hata olursa konsola yaz
                setError(true); // Hata durumunda konum hatasý state'i true yapýlýr
            }
        };

        fetchData(); // fetchData fonksiyonunu çalýþtýr
    }, []);

    const contents = (
        <table className="table" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Temperature (C)</th>
                    <th>Cloudiness (%)</th>
                    <th>State</th>
                </tr>
            </thead>
            <tbody>
                {weatherData.map(item => (
                    <tr key={item.dt}>
                        <td>{new Date(item.dt * 1000).toLocaleString()}</td> {/* Zamaný insan okunabilir formata çevir */}
                        <td>{(item.main.temp - 273.15).toFixed(2)} C</td> {/* Kelvin'den °C'ye dönüþtür */}
                        <td>{item.clouds.all}%</td> {/* Bulutluluk oraný */}
                        <td>{item.weather[0].description}</td> {/* Bulutluluk oraný */}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1 id="tableLabel">Weather Forecast</h1>
            {error ? (
                <div>Error: Unable to fetch weather data.</div>
            ) : (
                contents
            )}
        </div>
    );
}

export default Weather;
