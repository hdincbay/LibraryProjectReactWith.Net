import { useEffect, useState } from 'react';
import './First.css';
import { Routes, Route } from 'react-router-dom';
import Home from './Home.jsx';
import Login from './Login.jsx';
import SignUp from './SignUp.jsx';
import Weather from './Weather.jsx';
import UserCreate from './UserCreate.jsx';
import AuthorCreate from './AuthorCreate.jsx';
import BookCreate from './BookCreate.jsx';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Config from '../config.json';

function First() {
    const [data, setData] = useState(null);
    const [city, setCity] = useState("");
    const [icon, setIcon] = useState("");
    const [isControl, setIsControl] = useState(false);
    const [weatherIn3HoursClouds, setWeatherIn3HoursClouds] = useState(0);
    const [weatherIn3HoursHum, setWeatherIn3HoursHum] = useState(0);
    const [weatherIn3HoursTemp, setWeatherIn3HoursTemp] = useState(0);
    const [weatherIn3HoursDesc, setWeatherIn3HoursDesc] = useState(null);
    const [weatherIn3HoursDate, setWeatherIn3HoursDate] = useState(null);
    const [locationError, setLocationError] = useState(false); // Konum hatasý için state
    const navigate = useNavigate();

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

                    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`);
                    const data = await response.json();
                    


                    if (data.cod !== "200") {
                        throw new Error("API yanýtý hatalý");
                    }

                    setCity(data.city.name); // Þehir adýný state'e kaydet
                    

                    const weatherValueList = data.list;
                    const weatherValue3hour = weatherValueList[0];
                    const weatherValue3hourClouds = weatherValue3hour.clouds.all;
                    const weatherValue3hourHum = weatherValue3hour.main.humidity;
                    const weatherValue3hourTempKelvin = weatherValue3hour.main.temp;
                    const celsiusTempFloat = kelvinToCelsius(weatherValue3hourTempKelvin);
                    const celsiusTemp = celsiusTempFloat.toString().split('.')[0];
                    const temperatureWithDegree = `${celsiusTemp}\u00B0C`;
                    const weatherValue3hourDate = weatherValue3hour.dt;
                    const weatherValue3hourWeatherList = weatherValue3hour.weather;
                    const weatherValue3hourWeatherFirst = weatherValue3hourWeatherList[0];
                    const weatherValue3hourWeatherDescription = weatherValue3hourWeatherFirst.description;
                    const weatherValue3hourWeatherIcon = weatherValue3hourWeatherFirst.icon;
                    weatherFields.forEach((item, index) => {
                        if (item.responseField == weatherValue3hourWeatherDescription) {
                            setWeatherIn3HoursDesc(item.fieldTranslate);
                            return;  // Döngüyü burada sonlandýrýyoruz
                        }
                    });
                    // Tarih bilgisini çevirmek
                    const date = new Date(weatherValue3hourDate * 1000);
                    const hours = date.getHours();
                    const minutes = date.getMinutes();
                    const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
                    const iconsrc = "http://openweathermap.org/img/wn/" + weatherValue3hourWeatherIcon + ".png";
                    // State güncellemelerini yapmak
                    setIcon(iconsrc); // Þehir adýný state'e kaydet
                    setWeatherIn3HoursClouds(weatherValue3hourClouds);
                    setWeatherIn3HoursHum(weatherValue3hourHum);
                    setWeatherIn3HoursTemp(temperatureWithDegree);
                    setWeatherIn3HoursDate(formattedTime);

                    setData(data); // API'den gelen veriyi state'e kaydet
                    setLocationError(false); // Konum baþarýyla alýndý, hata durumu sýfýrlanýr
                    setIsControl(true);
                } else {
                    setLocationError(true); // Konum alýnamadý hatasý
                }
            } catch (error) {
                setLocationError(true); // Hata durumunda konum hatasý state'i true yapýlýr
            }
        };

        fetchData(); // fetchData fonksiyonunu çalýþtýr
    }, []); // Sadece component mount edildiðinde çalýþýr

    // Çýkýþ yapma fonksiyonu
    const handleLogout = () => {
        // localStorage'dan authToken'ý kaldýr
        localStorage.removeItem('authToken');
        // Kullanýcýyý login sayfasýna yönlendir
        navigate('/login');
    };

    // Kullanýcýnýn giriþ yapýp yapmadýðýný kontrol et
    const isLoggedIn = localStorage.getItem('authToken') !== null;

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light p-3">
                <Link className="navbar-brand" to="/Home">Navbar</Link>
                <Link to="/Weather" className="nav-link">Weather</Link>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item active">
                            <Link to="/Home" className="nav-link">Home</Link>
                        </li>
                    </ul>
                </div>

                {/* Konum verisi alýnana kadar hiçbir þey gösterilmesin */}
                {isControl && (
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item active">
                                <h4>{city} / Saat: {weatherIn3HoursDate}</h4>
                                <h6>{weatherIn3HoursTemp} / {weatherIn3HoursDesc} / %{weatherIn3HoursClouds} Bulutlu / %{weatherIn3HoursHum} Nem</h6>
                                <img src={icon} alt="Weather Icon"></img>
                            </li>
                        </ul>
                    </div>
                )}

                {/* Konum verisi henüz alýnmadýysa bir þey gösterilmesin */}
                {!isControl && !locationError && <h6>Konum Verisi Bekleniyor...</h6>}

                {/* Konum verisi alýnamazsa hata mesajý */}
                {locationError && <h3>Konum Alýnamadý</h3>}

                <div className="d-flex justify-content-end">
                    {isLoggedIn ? (
                        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                    ) : (
                        <>
                            <Link to="/SignUp" className="nav-link">
                                <div className="btn btn-success mx-2">Sign Up</div>
                            </Link>
                            <Link to="/Login" className="nav-link">
                                <div className="btn btn-primary mx-2">Login</div>
                            </Link>
                            
                        </>
                    )}
                </div>
            </nav>

            <Routes>
                <Route path="/Login" element={<Login />} />
                <Route path="/Home" element={<Home />} />
                <Route path="/SignUp" element={<SignUp />} />
                <Route path="/Weather" element={<Weather />} />
                <Route path="/UserCreate" element={<UserCreate />} />
                <Route path="/AuthorCreate" element={<AuthorCreate />} />
                <Route path="/BookCreate" element={<BookCreate />} />
            </Routes>
        </div>
    );
}

export default First;
