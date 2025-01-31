import { useEffect, useState } from 'react';
import './First.css';
import { Routes, Route, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
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
import Message from './Message/Message.jsx';

function First() {
    const [currentUserFullName, setCurrentUserFullName] = useState('');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userFullName');
        setCurrentUserFullName('');
        navigate('/login');
    };

    const isLoggedIn = localStorage.getItem('authToken') !== null;

    useEffect(() => {
        const getCurrentUserFullName = localStorage.getItem('userFullName');
        if (getCurrentUserFullName !== null) {
            setCurrentUserFullName(getCurrentUserFullName);
        }
    }, [isLoggedIn]);

    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light p-3" style={{ minHeight: '70px' }}>
                <Link className="navbar-brand" to="/Home">
                    <i className="fa-solid fa-book"></i> Library Application
                </Link>

                {/* Menu links */}
                <div className="btn-group">
                    <Link to="/Weather" className="btn btn-outline-dark">
                        <i className="fa-regular fa-snowflake"></i> Weather
                    </Link>
                    <Link to="/Message" className="btn btn-outline-dark">
                        <i className="fa-regular fa-message"></i> Message
                    </Link>
                    <Link to="/User" className="btn btn-outline-dark">
                        <i className="fa-regular fa-user"></i> User
                    </Link>
                    <Link to="/Author" className="btn btn-outline-dark">
                        <i className="fa-solid fa-book-open-reader"></i> Author
                    </Link>
                    <Link to="/Book" className="btn btn-outline-dark">
                        <i className="fa-solid fa-book-open"></i> Book
                    </Link>
                </div>

                {/* User info and auth buttons */}
                <div style={{ position: 'absolute', right: '1rem', top: '1rem', display: 'flex', alignItems: 'center' }}>
                    {/* Display user name only if logged in */}
                    {isLoggedIn && currentUserFullName && (
                        <p id="textfullname" style={{ marginRight: '1rem', fontSize: '1.2rem' }}>
                            <strong>{currentUserFullName}</strong>
                        </p>
                    )}

                    {/* Logout button if logged in, SignUp/Login buttons if not */}
                    {isLoggedIn ? (
                        <button className="btn btn-outline-danger" onClick={handleLogout}>
                            <i className="fa-solid fa-right-from-bracket"></i> Logout
                        </button>
                    ) : (
                        <div className="btn-group">
                            <Link to="/SignUp" className="nav-link">
                                <div className="btn btn-outline-success mx-1">Sign Up</div>
                            </Link>
                            <Link to="/Login" className="nav-link">
                                <div className="btn btn-outline-primary mx-1">Login</div>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Routes */}
            <Routes>
                <Route path="/Login" element={<Login />} />
                <Route path="/Home" element={<Home />} />
                <Route path="/SignUp" element={<SignUp />} />
                <Route path="/Weather" element={<Weather />} />
                <Route path="/UserCreate" element={<UserCreate />} />
                <Route path="/AuthorCreate" element={<AuthorCreate />} />
                <Route path="/AuthorUpdate/:authorId" element={<AuthorUpdate />} />
                <Route path="/UserUpdate/:userId" element={<UserUpdate />} />
                <Route path="/BookCreate" element={<BookCreate />} />
                <Route path="/Message" element={<Message />} />
                <Route path="/User" element={<User />} />
                <Route path="/Author" element={<Author />} />
                <Route path="/Book" element={<Book />} />
            </Routes>
        </div>
    );
}

export default First;
