import { useEffect, useState } from 'react';
import './User.css';
import Config from '../../config.json';
import { useParams, useNavigate } from 'react-router-dom';
function UserUpdate() {
    const { userId: paramAuthorId } = useParams(); // URL'den userId'yi alýyoruz
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [apiResponse, setApiResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [formData, setFormData] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [userName, setUserName] = useState('');
    const [tchatId, setTChatId] = useState('');
    // Component mount olduðunda WebSocket baðlantýsýný baþlatýyoruz
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsLoggedIn(true);
            if (paramAuthorId) {
                // Yazar bilgilerini API'den al
                const fetchAuthorData = async () => {
                    try {
                        const responseCurrentUser = await fetch(`${Config.restApiUrl}/api/User/GetOne/${paramAuthorId}`);
                        
                        if (responseCurrentUser.ok) {
                            const userData = await responseCurrentUser.json();
                            if (userData) {
                                setFirstName(userData.FirstName);
                                setLastName(userData.LastName);
                                setEmailAddress(userData.Email);
                                setTChatId(userData.t_chatId);
                                setUserName(userData.UserName);
                            }
                        } else {
                            alert('Kullanici bilgileri alýnamadý.');
                        }
                    } catch (error) {
                        console.error('Kullanici bilgileri yüklenirken bir hata oluþtu: ', error);
                        alert('Kullanici bilgileri yüklenemedi.');
                    }
                };
                fetchAuthorData();
            }
        } else {
            setIsLoggedIn(false);
            navigate('/Login');
        }

    }, [paramAuthorId, navigate]);

    if (!isLoggedIn) {
        return null;
    }
    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!userName.trim()) {
            alert('Username cannot be empty!');
            return;
        }

        try {
            const response = await fetch(`${Config.restApiUrl}/api/User/Update/${paramAuthorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    userName: userName,
                    email: emailAddress,
                    t_chatId: tchatId,
                })
            });

            if (response.ok) {
                navigate('/User');
            } else {
                const errorData = await response.json();
                alert(`Hata: ${errorData.message || 'User update failed!'}`);
            }
        } catch (error) {
            console.error('An error occurred while updating the author: ', error);
            alert('An error occurred, please try again.');
        }
    };
    return (
        <div id="componentcontent" style={{ width: '100%', paddingTop: '4rem', paddingLeft: 0, paddingRight: 0 }}>
            <div className="display-6 text-danger text-center">
                {apiResponse ?? error} 
            </div>
            
            <form onSubmit={handleSubmit}>
                <table style={{ width: '100%' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '20%' }}>
                                <strong>First Name</strong>
                            </td>
                            <td>
                                <input className="form-control"
                                    id="firstName"
                                    name="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '20%' }}>
                                <strong>Last Name</strong>
                            </td>
                            <td>
                                <input className="form-control"
                                    id="lastName"
                                    name="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '30%' }}>
                                <strong>User Name</strong>
                            </td>
                            <td>
                                <input className="form-control"
                                    id="userName"
                                    name="userName"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '30%' }}>
                                <strong>Email</strong>
                            </td>
                            <td>
                                <input className="form-control"
                                    id="email"
                                    name="email"
                                    value={emailAddress}
                                    onChange={(e) => setEmailAddress(e.target.value)} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '30%' }}>
                                <strong>Chat ID</strong>
                            </td>
                            <td>
                                <input className="form-control"
                                    id="tchatId"
                                    name="tchatId"
                                    value={tchatId}
                                    onChange={(e) => setTChatId(e.target.value)} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '30%' }}>
                            </td>
                            <td>
                                <button className="btn btn-success">Submit</button>
                            </td>
                        </tr>
                    </tbody>
                </table>

            </form>
            
        </div>
    );
}

export default UserUpdate;
