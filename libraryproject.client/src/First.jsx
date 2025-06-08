import { useEffect, useState, useCallback } from 'react';
import './First.css';
import Config from '../config.json';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import Home from './Home.jsx';
import User from './User/User.jsx';
import UserCreate from './User/UserCreate.jsx';
import Login from './Entry/Login.jsx';
import SignUp from './Entry/SignUp.jsx';
import Weather from './Weather/Weather.jsx';
import Author from './Author/Author.jsx';
import AuthorCreate from './Author/AuthorCreate.jsx';
import AuthorUpdate from './Author/AuthorUpdate.jsx';
import UserUpdate from './User/UserUpdate.jsx';
import Book from './Book/Book.jsx';
import BookCreate from './Book/BookCreate.jsx';
import BookUpdate from './Book/BookUpdate.jsx';
import Message from './Message/Message.jsx';
import { useLocation } from 'react-router-dom';

function First() {
    const navigate = useNavigate();
    const [currentUserFullName, setCurrentUserFullName] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));

    const handleLogout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userFullName');
        setCurrentUserFullName('');
        setIsLoggedIn(false);
        navigate('/login');
    }, [navigate]);
    const location = useLocation();
    useEffect(() => {
        const checkSession = async () => {
            if (location.pathname == '/signup') {
                navigate('/signup');
                return;
            }
            const token = localStorage.getItem('authToken');
            const userFullName = localStorage.getItem('userFullName');
            setCurrentUserFullName(userFullName);
            if (!token) {
                setIsLoggedIn(false);
                navigate('/login');
                return;
            }

            try {
                const restUrl = Config.restApiUrl;
                const response = await fetch(`${restUrl}/api/User/SessionControl`, {
                    method: 'POST',
                    headers: {
                        'token': token,
                    },
                });

                if (response.ok) {
                    setIsLoggedIn(true);
                } else {
                    handleLogout();
                }
            } catch (error) {
                console.error('Session control error: ', error);
                handleLogout();
            }
        };
        checkSession();
        window.addEventListener('beforeunload', handleLogout);
        return () => window.removeEventListener('beforeunload', handleLogout);
    }, [handleLogout, navigate]);

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light p-3" style={{ minHeight: '70px' }}>
                <NavLink className="navbar-brand" to="/home">
                    <i className="fa-solid fa-book"></i> Library Application
                </NavLink>

                <div className="btn-group" id="navbar">
                    <NavLink to="/weather" className="btn btn-outline-dark" activeclassname="active">
                        <i className="fa-regular fa-snowflake"></i> Weather
                    </NavLink>
                    <NavLink to="/message" className="btn btn-outline-dark" activeclassname="active">
                        <i className="fa-regular fa-message"></i> Message
                    </NavLink>
                    <NavLink to="/user" className="btn btn-outline-dark" activeclassname="active">
                        <i className="fa-regular fa-user"></i> User
                    </NavLink>
                    <NavLink to="/author" className="btn btn-outline-dark" activeclassname="active">
                        <i className="fa-solid fa-book-open-reader"></i> Author
                    </NavLink>
                    <NavLink to="/book" className="btn btn-outline-dark" activeclassname="active">
                        <i className="fa-solid fa-book-open"></i> Book
                    </NavLink>
                </div>

                <div style={{ position: 'absolute', right: '1rem', top: '1rem', display: 'flex', alignItems: 'center' }}>
                    {isLoggedIn && currentUserFullName && (
                        <p id="textfullname" style={{ marginRight: '1rem', fontSize: '1.2rem' }}>
                            <strong>{currentUserFullName}</strong>
                        </p>
                    )}

                    {isLoggedIn ? (
                        <button className="btn btn-outline-danger" onClick={handleLogout}>
                            <i className="fa-solid fa-right-from-bracket"></i> Logout
                        </button>
                    ) : (
                        <div className="btn-group">
                            <NavLink to="/signup" className="nav-link">
                                <div className="btn btn-outline-success mx-1">Sign Up</div>
                            </NavLink>
                            <NavLink to="/login" className="nav-link">
                                <div className="btn btn-outline-primary mx-1">Login</div>
                            </NavLink>
                        </div>
                    )}
                </div>
            </nav>

            <Routes>
                <Route path="/login/*" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/weather" element={<Weather />} />
                <Route path="/usercreate" element={<UserCreate />} />
                <Route path="/authorcreate" element={<AuthorCreate />} />
                <Route path="/authorupdate/:authorId" element={<AuthorUpdate />} />
                <Route path="/userupdate/:userId" element={<UserUpdate />} />
                <Route path="/bookupdate/:bookId" element={<BookUpdate />} />
                <Route path="/bookcreate" element={<BookCreate />} />
                <Route path="/message" element={<Message />} />
                <Route path="/user" element={<User />} />
                <Route path="/author" element={<Author />} />
                <Route path="/book" element={<Book />} />
            </Routes>
        </div>
    );
}

export default First;
