import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import Config from '../config.json';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [tempData, setTempData] = useState([]);
    const [timeData, setTimeData] = useState([]);
    const [humData, setHumData] = useState([]);
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
                    const kelvinToCelsius = (kelvin) => kelvin - 273.15;
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });

                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
                    const data = await response.json();

                    if (Array.isArray(data.list)) {
                        data.list.forEach(function (element) {
                            setTempData(prevTempData => [...prevTempData, kelvinToCelsius(element.main.temp)]);
                            setHumData(prevTempData => [...prevTempData, element.main.humidity]);
                            setTimeData(prevTimeData => [
                                ...prevTimeData,
                                (() => {
                                    const date = new Date(element.dt * 1000);
                                    const today = new Date();
                                    const tomorrow = new Date(today);
                                    tomorrow.setDate(today.getDate() + 1);

                                    const isToday = date.toDateString() === today.toDateString();
                                    const isTomorrow = date.toDateString() === tomorrow.toDateString();

                                    const dateString = date.toLocaleDateString('tr-TR', { weekday: 'long', day: '2-digit', month: '2-digit' });
                                    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                                    if (isToday) {
                                        return `Bugun ${timeString}`;
                                    } else if (isTomorrow) {
                                        return `Yarin ${timeString}`;
                                    } else {
                                        return `${dateString} ${timeString}`;
                                    }
                                })()
                            ]);
                        });
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

    const data = {
        labels: timeData,
        datasets: [
            {
                label: 'Sicaklik Verisi',
                data: tempData,
                fill: false,
                borderColor: 'rgba(15, 168, 82)',
                tension: 0.1,
            },
            {
                label: 'Nem Verisi (%)',
                data: humData,
                fill: false,
                borderColor: 'rgba(112, 2, 2)',
                tension: 0.1,
            }
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
        },
    };

    return (
        <div style={{ width: '100%', paddingTop: '4rem', paddingLeft: 0, paddingRight: 0 }}>
            <h2>Hava Durumu</h2>
            <Line data={data} options={options} />
        </div>
    );
};

export default Home;
