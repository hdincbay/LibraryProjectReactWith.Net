import { useState } from 'react';
import './Login.css';
import { Routes, Route } from 'react-router-dom'
import SignUp from './SignUp.jsx'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom';
import Config from '../../config.json';
function Login() {
    const [userName, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);

        const userData = { userName, password };

        try {
            var restUrl = Config.restApiUrl;
            const response = await fetch(`${restUrl}/api/User/Login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),

            });
            
            if (!response.ok) {
                const textResponse = await response.text();
                throw new Error(textResponse);
            }
            else {
                const textResponse = await response.json();
                const token = textResponse.token;
                const userFullName = textResponse.userFullName;
                const userName = textResponse.userName;
                const userId = textResponse.userId;
                localStorage.setItem('authToken', token);
                localStorage.setItem("userFullName", userFullName);
                localStorage.setItem("userName", userName);
                localStorage.setItem("currentUserId", userId);

                navigate('/Home');
            }
            const contentType = response.headers.get("Content-Type");

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="componentcontent">
            <div className="container">
                <div className="row">
                    <div className="col-md-6">
                        <div className="display-6">
                            Login Page
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group my-2">
                                <label className="form-label">User Name</label>
                                <input
                                    className="form-control my-2"
                                    type="text"
                                    value={userName}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    className="form-control my-2"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {error && <p className="error-text text-danger">{error}</p>}
                            <div className="row">
                                <div className="col-md-12">
                                    <div>
                                        <button type="submit" className="btn btn-outline-primary w-100" disabled={loading}>
                                            {loading ? 'Loading...' : 'Login'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div
                        style={{
                            backgroundImage: 'url(/img/login_photo.jpg)',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover'
                        }}
                        className="col-md-6"
                    >
                    </div>
                </div>
            </div>
            <Routes>
                <Route path="/SignUp" element={<SignUp />} />
            </Routes>
        </div>
    );
}

export default Login;
