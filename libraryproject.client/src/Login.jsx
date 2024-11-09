import { useState } from 'react';
import './Login.css';

function Login() {
    const [userName, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form gönderildiðinde çalýþacak fonksiyon
    const handleSubmit = async (event) => {
        event.preventDefault();  // Sayfanýn yeniden yüklenmesini engeller

        setLoading(true);  // API çaðrýsý sýrasýnda bir yükleniyor durumu

        const userData = { userName, password };

        try {
            // API'ye POST isteði gönderme
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
            console.log('Sunucudan dönen string:', textResponse);

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
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Loading...' : 'Submit'}
                </button>
            </form>
        </div>
    );
}

export default Login;
