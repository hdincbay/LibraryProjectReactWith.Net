import { useEffect, useState } from 'react';
import './User.css';
import Config from '../../config.json';
import { useParams, useNavigate } from 'react-router-dom';
function UserUpdate() {
    const { userId: paramAuthorId } = useParams(); // URL'den authorId'yi alýyoruz
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [apiResponse, setApiResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [formData, setFormData] = useState('');

    // Component mount olduðunda WebSocket baðlantýsýný baþlatýyoruz
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsLoggedIn(true);
            if (paramAuthorId) {
                // Yazar bilgilerini API'den al
                const fetchAuthorData = async () => {
                    try {
                        const responseCurrentUser= await fetch(`${Config.restApiUrl}/api/User/GetCurrentUser`);
                        const dataCurrentUser = await responseCurrentUser.text();
                        
                        if (response.ok) {
                            
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
    async function userCreate(firstName, lastName, userName, email, chatId, password, passwordConfirm) {
        const data = {
            firstName: firstName,
            lastName: lastName,
            userName: userName,
            t_chatId: chatId,
            email: email,
            password: password,
            passwordConfirm: passwordConfirm
        };
        const restApiUrlVal = Config.restApiUrl;
        try {
            const response = await fetch(`${restApiUrlVal}/api/User/Update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const jsonData = await response.text();
            setApiResponse(jsonData);
            console.log(jsonData);
            
        } catch (error) {
            console.error('Mesaj gönderilirken bir hata oluþtu:', error);
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password != formData.passwordconfirm) {
            setError('Passwords do not match');
        }
        else {
            await userCreate(formData.firstName, formData.lastName, formData.userName, formData.email, formData.t_chatId, formData.password, formData.passwordconfirm);
        }
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
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
                                    value={formData.firstName}
                                    onChange={handleChange} />
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
                                    value={formData.lastName}
                                    onChange={handleChange} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '20%' }}>
                                <strong>User Name</strong>
                            </td>
                            <td>
                                <input className="form-control"
                                    id="userName"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleChange} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '20%' }}>
                                <strong>Email</strong>
                            </td>
                            <td>
                                <input className="form-control"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '20%' }}>
                                <strong>Chat ID</strong>
                            </td>
                            <td>
                                <input className="form-control"
                                    id="t_chatId"
                                    name="t_chatId"
                                    value={formData.t_chatId}
                                    onChange={handleChange} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '20%' }}>
                                <strong>Password</strong>
                            </td>
                            <td>
                                <input className="form-control" type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '20%' }}>
                                <strong>Password Confirm</strong>
                            </td>
                            <td>
                                <input className="form-control" type="password"
                                    id="passwordconfirm"
                                    name="passwordconfirm"
                                    value={formData.passwordconfirm}
                                    onChange={handleChange} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '20%' }}>
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
