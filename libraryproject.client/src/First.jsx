import { useEffect, useState } from 'react';
import './First.css';
import { Routes, Route } from 'react-router-dom';
import Home from './Home.jsx';
import Login from './Login.jsx';
import SignUp from './SignUp.jsx';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Config from '../config.json';

function First() {
    const [data, setData] = useState(null);
    const [city, setCity] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const apiKey = Config.apiKey; // Config dosyasýndan apiKey'i al
            const lat = Config.lat; // Config dosyasýndan enlem deðerini al
            const lon = Config.lon; // Config dosyasýndan enlem deðerini al
            console.log(apiKey); // API anahtarýný logla
            try {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`);
                const data = await response.json();
                setCity(data.city.name); // Þehir adýný state'e kaydet
                setData(data); // API'den gelen veriyi state'e kaydet
            } catch (error) {
                console.error('API fetch error:', error); // Hata olursa konsola yaz
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
            </Routes>

            {/* Ekrana þehir adýný yazdýr */}
            <div>
                <h2>{city ? `City: ${city}` : "Loading city..."}</h2>
            </div>
        </div>
    );
}

export default First;
