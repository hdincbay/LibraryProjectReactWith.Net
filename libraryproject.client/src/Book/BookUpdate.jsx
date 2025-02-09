import { useEffect, useState } from 'react';
import './BookUpdate.css';
import Config from '../../config.json';
import { useParams, useNavigate } from 'react-router-dom';

function BookUpdate() {
    const { bookId: paramBookId } = useParams(); // URL'den bookId'yi alýyoruz
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [bookName, setBookName] = useState('');
    const [available, setAvailable] = useState('');
    const [authorList, setAuthorList] = useState([]);
    const [authorId, setAuthorId] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

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
        const token = localStorage.getItem('authToken');
        if (token) {
            getAuthorListThenSetAuthor();
            setIsLoggedIn(true);

            if (paramBookId) {
                // Kitap ID'si varsa, ilgili kitap bilgilerini API'den al
                const fetchBookData = async () => {
                    try {
                        const response = await fetch(`${Config.restApiUrl}/api/Book/GetById/${paramBookId}`);
                        const data = await response.json();
                        if (response.ok) {
                            setBookName(data.name);
                            setAuthorId(data.authorId);  // Kitabýn yazarýný set et
                            setAvailable(data.available);
                        } else {
                            alert('Kitap bilgileri alinamadi');
                        }
                    } catch (error) {
                        console.error('Kitap bilgileri yuklenirken bir hata olustu: ', error);
                        alert('Kitap bilgileri yuklenemedi.');
                    }
                };
                fetchBookData();
            }
        } else {
            setIsLoggedIn(false);
            navigate('/Login');
        }
    }, [paramBookId, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const token = localStorage.getItem('authToken');

        if (!bookName.trim()) {
            alert('Kitap adi bos olamaz!');
            return;
        }

        if (!authorId || authorId === "0") {
            alert('Bir yazar seciniz!');
            return;
        }

        try {
            const response = await fetch(`${Config.restApiUrl}/api/Book/Update`, {
                method: 'PUT',
                body: JSON.stringify({
                    bookId: paramBookId,  // Parametre olarak kitap ID'si de gönderiliyor
                    name: bookName,
                    authorId: authorId,
                    available: available
                }),
            });
            if (response.ok) {
                navigate('/Book');
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message);
            }
        } catch (error) {
            console.error('Kitap guncellenirken hata olustu:', error);
            setErrorMessage(error);
        }
    };

    if (!isLoggedIn) {
        return null;
    }

    return (
        <div id="componentcontent" style={{ width: '100%', paddingTop: '4rem', paddingLeft: 0, paddingRight: 0 }}>
            {errorMessage}
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
                                    value={authorId}
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
                            <td style={{ width: '20%' }}>
                                <label htmlFor="available"><strong>Available</strong></label>
                            </td>
                            <td>
                                <div className="d-flex justify-content-start">
                                    <input
                                        id="available"
                                        type="checkbox"
                                        className="form-check-input mx-2"
                                        checked={available}  // checked ile durumu kontrol et
                                        onChange={(e) => setAvailable(e.target.checked)} // onChange ile checkbox'ýn deðerini kontrol et
                                    />
                                </div>
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

export default BookUpdate;
