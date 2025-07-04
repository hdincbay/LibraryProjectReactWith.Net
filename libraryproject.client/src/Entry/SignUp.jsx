import { useState } from 'react';
import './SignUp.css';
import { useNavigate } from 'react-router-dom';
import Config from '../../config.json';
function SignUp() {
    const [userName, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);

        const userData = { firstName, lastName, userName, phoneNumber, email, password, passwordConfirm };

        try {
            var restUrl = Config.restApiUrl;
            const response = await fetch(`${restUrl}/api/User/SignUp`, {
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
        <div id="componentcontent">
            <div className="container">
                <div className="row">
                    <div className="col-md-6">
                        <div className="display-6">
                            Sign Up Page
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group my-2">
                                <label className="form-label">First Name</label>
                                <input
                                    className="form-control my-2"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstname(e.target.value)}
                                />
                            </div>
                            <div className="form-group my-2">
                                <label className="form-label">Last Name</label>
                                <input
                                    className="form-control my-2"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;
