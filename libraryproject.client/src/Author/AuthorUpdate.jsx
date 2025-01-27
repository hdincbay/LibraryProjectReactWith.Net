import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AuthorUpdate.css';
import Config from '../../config.json';

function AuthorUpdate() {
    const { authorId: paramAuthorId } = useParams(); // URL'den authorId'yi alýyoruz
    const navigate = useNavigate();

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authorId, setAuthorId] = useState('');
    const [authorName, setAuthorName] = useState('');
    const [authorSurName, setAuthorSurName] = useState('');
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsLoggedIn(true);
            if (paramAuthorId) {
                setAuthorId(paramAuthorId);
                // Yazar bilgilerini API'den al
                const fetchAuthorData = async () => {
                    try {
                        const response = await fetch(`${Config.restApiUrl}/api/Author/GetById/${paramAuthorId}`);
                        const data = await response.json();
                        if (response.ok) {
                            setAuthorName(data.name);
                            setAuthorSurName(data.surname);
                        } else {
                            alert('Yazar bilgileri alýnamadý.');
                        }
                    } catch (error) {
                        console.error('Yazar bilgileri yüklenirken bir hata oluþtu: ', error);
                        alert('Yazar bilgileri yüklenemedi.');
                    }
                };
                fetchAuthorData();
            }
        } else {
            setIsLoggedIn(false);
            navigate('/Login');
        }
        
    }, [paramAuthorId, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!authorName.trim()) {
            alert('Yazar adý boþ olamaz!');
            return;
        }

        try {
            const response = await fetch(`${Config.restApiUrl}/api/Author/Update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    authorId: authorId,
                    name: authorName,
                    surName: authorSurName
                })
            });

            if (response.ok) {
                navigate('/Author');
            } else {
                const errorData = await response.json();
                alert(`Hata: ${errorData.message || 'Author update failed!'}`);
            }
        } catch (error) {
            console.error('Yazar güncellenirken bir hata oluþtu: ', error);
            alert('Bir hata oluþtu, tekrar deneyin.');
        }
    };

    if (!isLoggedIn) {
        return null; // Eðer kullanýcý giriþ yapmamýþsa hiçbir þey render etme
    }

    return (
        <div style={{ width: '100%', paddingTop: '4rem', paddingLeft: 0, paddingRight: 0 }}>
            <form onSubmit={handleSubmit}>
                <table style={{ width: '100%' }}>
                    <tbody>
                        <tr>
                            <td style={{ width: '20%' }}>
                                <label htmlFor="authorName"><strong>Name</strong></label>
                            </td>
                            <td>
                                <input
                                    id="authorName"
                                    className="form-control"
                                    value={authorName}
                                    onChange={(e) => setAuthorName(e.target.value)}
                                    placeholder="Enter author name"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '20%' }}>
                                <label htmlFor="authorSurName"><strong>Surname</strong></label>
                            </td>
                            <td>
                                <input
                                    id="authorSurName"
                                    className="form-control"
                                    value={authorSurName}
                                    onChange={(e) => setAuthorSurName(e.target.value)}
                                    placeholder="Enter author surname"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '20%' }}></td>
                            <td>
                                <button type="submit" className="btn btn-success">Submit</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </form>
        </div>
    );
}

export default AuthorUpdate;
