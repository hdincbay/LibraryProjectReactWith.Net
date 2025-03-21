import { useEffect, useState } from 'react';
import './AuthorCreate.css';
import Config from '../../config.json';
import { useNavigate } from 'react-router-dom';
function AuthorCreate() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authorName, setAuthorName] = useState('');
    const [authorSurName, setAuthorSurName] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
            navigate('/Login');
        }
    }, [navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem('authToken');

        if (!authorName.trim()) {
            alert('Yazar adi bo� olamaz!');
            return;
        }

        try {
            const response = await fetch(`${Config.restApiUrl}/api/Author/Create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: authorName, surName: authorSurName }),
            });

            if (response.ok) {
                setAuthorName('');
                setAuthorSurName('');
            } else {
                const errorData = await response.json();
                alert(`Hata: ${errorData.message || 'Kitap olu�turulamad�'}`);
            }
        } catch (error) {
            console.error('Author created failed: ', error);
            alert('Author created failed: ', error);
        }
    };

    if (!isLoggedIn) {
        return null;
    }

    return (
        <div id="componentcontent" style={{ width: '100%', paddingTop: '4rem', paddingLeft: 0, paddingRight: 0 }}>
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
                                    onChange={(i) => setAuthorName(i.target.value)}
                                    placeholder="Yazar adi girin"
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
                                    onChange={(i) => setAuthorSurName(i.target.value)}
                                    placeholder="Yazar soyadi girin"
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

export default AuthorCreate;
