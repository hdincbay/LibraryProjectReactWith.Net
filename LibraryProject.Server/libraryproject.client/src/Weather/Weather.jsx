import { useEffect, useState } from 'react';
import './Weather.css';
import Config from '../../config.json';
import { useNavigate } from 'react-router-dom';

function Weather() {
    const [weatherData, setWeatherData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isControl, setIsControl] = useState(false);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
            navigate('/Login');
        }
        const fetchData = async () => {
            const apiKey = Config.apiKey;
            const weatherFields = Config.weathers;
            const podFields = Config.pods;

            try {
                if (navigator.geolocation) {

                    const kelvinToCelsius = (kelvin) => {
                        return kelvin - 273.15;
                    };
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });

                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
                    const data = await response.json();


                    if (Array.isArray(data.list)) {
                        data.list.forEach(function (element) {
                            element.weather[0].icon = "http://openweathermap.org/img/wn/" + element.weather[0].icon + ".png";
                            podFields.forEach((item) => {
                                if (item.responseField == element.sys.pod) {
                                    element.sys.pod = item.fieldTranslate;
                                }
                            });
                            weatherFields.forEach((item) => {
                                if (item.responseField == element.weather[0].description) {
                                    element.weather[0].description = item.fieldTranslate;
                                }
                            });
                        });
                        
                        setWeatherData(data.list);
                    }

                    setError(false);
                    setIsControl(true);
                } else {
                    setError(true);
                }
            } catch (error) {
                setError(true);
            }
        };

        fetchData();
    }, [navigate]);

    const contents = (
        <table className="table table-hover" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Day/Night</th>
                    <th>Temperature (C)</th>
                    <th>Cloudiness (%)</th>
                    <th>State</th>
                    <th>Icon</th>
                </tr>
            </thead>
            <tbody>
                {weatherData.map(item => (
                    <tr key={item.dt} >
                        <td>
                            {new Date(item.dt * 1000).toLocaleString('tr-TR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            })}
                        </td>
                        <td>{item.sys.pod}</td>
                        <td>{(item.main.temp - 273.15).toFixed(2)} C</td>
                        <td>{item.clouds.all}%</td>
                        <td>{item.weather[0].description}</td>
                        <td><img src={item.weather[0].icon} alt="Weather Icon" /></td>
                    </tr>
                ))}
            </tbody>

        </table>
    );

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div id="componentcontent">
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
