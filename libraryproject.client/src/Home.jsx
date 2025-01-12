import { useEffect, useState } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';  // Yönlendirme için kullanýlýyor
import Book from './Book.jsx';
import Author from './Author.jsx';
import User from './User.jsx';

function Home() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // localStorage'dan token'ý alýp, giriþ durumunu kontrol ediyoruz
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
        <div style={{ width: '100%' }}>
            <div className="row">
                <div className="col-md-6">
                    <Book />
                </div>
                <div className="col-md-3">
                    <Author />
                </div>
                <div className="col-md-3">
                    <User />
                </div>
            </div>
        </div>
    );
}

export default Home;
