import { useEffect, useState } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';  // Y�nlendirme i�in kullan�l�yor
import App from './App.jsx';
import Start from './Start.jsx';
import User from './User.jsx';

function Home() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // localStorage'dan token'� al�p, giri� durumunu kontrol ediyoruz
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
            navigate('/Login');
        }
    }, [navigate]);

    if (!isLoggedIn) {
        return null;
    }

    return (
        <div>
            <div className="display-1 my-3 text-danger">Info Page</div>
            <div className="row">
                <div className="col-md-4">
                    <App />
                </div>
                <div className="col-md-4">
                    <Start />
                </div>
                <div className="col-md-4">
                    <User />
                </div>
            </div>
        </div>
    );
}

export default Home;
