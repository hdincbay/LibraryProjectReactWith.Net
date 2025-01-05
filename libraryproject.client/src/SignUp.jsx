import { useState } from 'react';
import './SignUp.css';
import { useNavigate } from 'react-router-dom';
function SignUp() {
    const [userName, setUsername] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Form gönderildiðinde çalýþacak fonksiyon
    const handleSubmit = async (event) => {
        event.preventDefault();  // Sayfanýn yeniden yüklenmesini engeller

        setLoading(true);  // API çaðrýsý sýrasýnda bir yükleniyor durumu

        const userData = { userName, phoneNumber, email, password, passwordConfirm };

        try {
            // API'ye POST isteði gönderme
            const response = await fetch('https://localhost:7275/api/User/SignUp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
                
            });
            const textResponse = await response.text();
            if (!response.ok) {
                throw new Error(textResponse);
            }
            else {
                navigate('/Login');
            }
            const contentType = response.headers.get("Content-Type");
            
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="container">
                <div className="row">
                    <div style={{ height: '5rem' }} className="col-md-12"></div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <div className="display-6">
                            Sign Up Page
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
                            <div className="form-group my-2">
                                <label className="form-label">Phone Number</label>
                                <input
                                    className="form-control my-2"
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                />
                            </div>
                            <div className="form-group my-2">
                                <label className="form-label">Email Address</label>
                                <input
                                    className="form-control my-2"
                                    type="tel"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                            <div className="form-group">
                                <label className="form-label">Password Confirm</label>
                                <input
                                    className="form-control my-2"
                                    type="password"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                />
                            </div>
                            {error && <p className="error-text text-danger">{error}</p>}
                            <div className="row">
                                <div className="col-md-8"></div>
                                <div className="col-md-4">
                                    <button type="submit" className="btn btn-success" disabled={loading}>
                                        {loading ? 'Loading...' : 'Sign Up'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div
                        style={{
                            backgroundImage: 'url(/img/signup_photo.jpg)',
                            backgroundPosition: 'center',
                            backgroundSize: 'cover'
                        }}
                        className="col-md-6"
                    >
                        {/* Ýçerik */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
