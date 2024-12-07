import { useEffect, useState } from 'react';
import './First.css';
import { Routes, Route } from 'react-router-dom'
import Example from './Example.jsx'
import Home from './Home.jsx'
import Login from './Login.jsx'
import SignUp from './SignUp.jsx'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';

function First() {
    const navigate = useNavigate();

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
        </div>
    );
}

export default First;
