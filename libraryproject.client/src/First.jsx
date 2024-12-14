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
            const apiKey = Config.apiKey; // Config dosyas�ndan apiKey'i al
            const lat = Config.lat; // Config dosyas�ndan enlem de�erini al
            const lon = Config.lon; // Config dosyas�ndan enlem de�erini al
            console.log(apiKey); // API anahtar�n� logla
            try {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`);
                const data = await response.json();
                setCity(data.city.name); // �ehir ad�n� state'e kaydet
                setData(data); // API'den gelen veriyi state'e kaydet
            } catch (error) {
                console.error('API fetch error:', error); // Hata olursa konsola yaz
            }
        };

        fetchData(); // fetchData fonksiyonunu �al��t�r
    }, []); // Sadece component mount edildi�inde �al���r

    // ��k�� yapma fonksiyonu
    const handleLogout = () => {
        // localStorage'dan authToken'� kald�r
        localStorage.removeItem('authToken');
        // Kullan�c�y� login sayfas�na y�nlendir
        navigate('/login');
    };

    // Kullan�c�n�n giri� yap�p yapmad���n� kontrol et
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

            {/* Ekrana �ehir ad�n� yazd�r */}
            <div>
                <h2>{city ? `City: ${city}` : "Loading city..."}</h2>
            </div>
        </div>
    );
}

export default First;
