import { useState } from 'react';
import './Login.css';

function Login() {
    const [userName, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form g�nderildi�inde �al��acak fonksiyon
    const handleSubmit = async (event) => {
        event.preventDefault();  // Sayfan�n yeniden y�klenmesini engeller

        setLoading(true);  // API �a�r�s� s�ras�nda bir y�kleniyor durumu

        const userData = { userName, password };

        try {
            // API'ye POST iste�i g�nderme
            const response = await fetch('https://localhost:7275/api/User/Login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
                
            });
            if (!response.ok) {
                throw new Error('Hata olustu, lutfen tekrar deneyin');
            }

            const contentType = response.headers.get("Content-Type");

            const textResponse = await response.text();
            console.log('Sunucudan d�nen string:', textResponse);

            if (textResponse) {
                alert(textResponse);
            }
        } catch (error) {
            console.error('API istegi basarisiz:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="container">
                <div className="row">
                    <div style={{ height: '10rem' }} className="col-md-12"></div>
                </div>
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
                            {error && <p className="error-text">{error}</p>}
                            <div className="row">
                                <div className="col-md-8"></div>
                                <div className="col-md-4">
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Loading...' : 'Submit'}
                                    </button>
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
                        {/* ��erik */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;