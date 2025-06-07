import { useEffect, useState } from 'react';
import './BookCreate.css';
import Config from '../../config.json';
import { useNavigate } from 'react-router-dom';

function BookCreate() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [bookName, setBookName] = useState('');
    const [authorList, setAuthorList] = useState([]);
    const [authorId, setAuthorId] = useState(0);

    const getAuthorListThenSetAuthor = async () => {
        const restUrl = Config.restApiUrl;
        const response = await fetch(`${restUrl}/api/Author/GetAll`, {
            method: 'GET'
        });

        const textResponse = await response.text();
        try {
            const jsonResponse = JSON.parse(textResponse);

            if (Array.isArray(jsonResponse)) {
                setAuthorList(jsonResponse);
            }
        } catch (error) {
            console.error('JSON parse hatasý:', error);
        }
    };

    useEffect(() => {
        const checkSession = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                var restUrl = Config.restApiUrl;
                const response = await fetch(`${restUrl}/api/User/SessionControl`, {
                    method: 'POST',
                    headers: {
                        'token': token
                    }
                });
            
                if (response.ok) {
                    setIsLoggedIn(true);
                }
                else {
                    setIsLoggedIn(false);
                    navigate('/Login');
                }
            } else {
                setIsLoggedIn(false);
                navigate('/Login');
            }
        }
        checkSession();
    }, [navigate]);
    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem('authToken');

        if (!bookName.trim()) {
            alert('Kitap adý boþ olamaz!');
            return;
        }

        if (!authorId || authorId === "0") {
            alert('Bir yazar seçiniz!');
            return;
        }

        try {
            const response = await fetch(`${Config.restApiUrl}/api/Book/Create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: bookName,
                    authorId: parseInt(authorId, 10)
                }),
            });

            if (response.ok) {
                setAuthorId('');
                setBookName('');
            } else {
                const errorData = await response.json();
                alert(`Hata: ${errorData.message || 'Kitap oluþturulamadý'}`);
            }
        } catch (error) {
            console.error('Book created failed:', error);
            alert('Book created failed:', error);
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
                                <label htmlFor="bookName"><strong>Name</strong></label>
                            </td>
                            <td>
                                <input
                                    id="bookName"
                                    className="form-control"
                                    value={bookName}
                                    onChange={(e) => setBookName(e.target.value)}
                                    placeholder="Enter the book name"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '20%' }}>
                                <label htmlFor="authorList"><strong>Author</strong></label>
                            </td>
                            <td>
                                <select
                                    id="authorList"
                                    className="form-control"
                                    value={authorId || 0}
                                    onChange={(e) => setAuthorId(e.target.value)}
                                >
                                    <option value="0">Select an author</option>
                                    {authorList.map((author) => (
                                        <option key={author.authorId} value={author.authorId}>
                                            {author.name + ' ' + author.surname}
                                        </option>
                                    ))}
                                </select>
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

export default BookCreate;
