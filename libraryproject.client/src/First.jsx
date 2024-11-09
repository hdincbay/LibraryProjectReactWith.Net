import { useEffect, useState } from 'react';
import './First.css';
import { Routes, Route } from 'react-router-dom'
import Example from './Example.jsx'
import Home from './Home.jsx'
import Login from './Login.jsx'
import { Link } from 'react-router-dom'

function First() {
    return (
        
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light p-3">
                <a className="navbar-brand" href="#">Navbar</a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav">
                        <li className="nav-item active">
                            <Link to="/Home" className="nav-link">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/Login" className="nav-link">Login</Link>
                        </li>
                    </ul>
                </div>
            </nav>
            <Routes>
                <Route path="/Login" element={<Login />} />
                <Route path="/Home" element={<Home />} />
            </Routes>
        </div>
    );
}
export default First;
