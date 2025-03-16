import { useEffect, useState } from 'react';
import './BookUpdate.css';
import Config from '../../config.json';
import { useParams, useNavigate } from 'react-router-dom';

function BookUpdate() {
    const { bookId: paramBookId } = useParams();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [bookName, setBookName] = useState('');
    const [available, setAvailable] = useState(false);
    const [authorList, setAuthorList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [authorId, setAuthorId] = useState(0);
    const [loanDuration, setLoanDuration] = useState(0);
    const [loanDate, setLoanDate] = useState('');
    const [loanEndDate, setLoanEndDate] = useState('');
    const [userId, setUserId] = useState(0);
    const [lenderId, setLenderId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    function formatDate(dateStr) {
        let date = new Date(dateStr);
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let year = date.getFullYear();
        let hours = String(date.getHours()).padStart(2, '0');
        let minutes = String(date.getMinutes()).padStart(2, '0');
        var result = `${day}/${month}/${year} ${hours}:${minutes}`;
        if (result == "01/01/1970 02:00") {
            result = '';
        }
        return result;
    }
    const getAuthorListThenSetAuthor = async () => {
        const restUrl = Config.restApiUrl;
        const response = await fetch(`${restUrl}/api/Author/GetAll`, { method: 'GET' });

        const textResponse = await response.text();
        try {
            const jsonResponse = JSON.parse(textResponse);
            if (Array.isArray(jsonResponse)) {
                setAuthorList(jsonResponse);
            }
        } catch (error) {
            console.error('JSON parse error:', error);
        }
    };

    const getUserListThenSetUser = async () => {
        const restUrl = Config.restApiUrl;
        const response = await fetch(`${restUrl}/api/User/GetAll`, { method: 'GET' });

        const textResponse = await response.text();
        try {
            const jsonResponse = JSON.parse(textResponse);
            if (Array.isArray(jsonResponse)) {
                const filteredUsers = jsonResponse.filter(user => user.normalizedUserName !== 'SYSTEMUSER');
                setUserList(filteredUsers);
            }
        } catch (error) {
            console.error('JSON parse error:', error);
        }
    };

    const availableChange = (available) => {
        setAvailable(available);
        if (available) {
            setUserId(0);
            setLoanDuration(0);
            setLoanDate('');
            setLoanEndDate('');
        }
    };

    const userChange = (user) => {
        setUserId(user);
        if (user == 0) {
            setAvailable(true);
        } else {
            setAvailable(false);
        }
    };

    useEffect(() => {
        const currentUserId = localStorage.getItem('currentUserId');
        const token = localStorage.getItem('authToken');
        if (token) {
            getAuthorListThenSetAuthor();
            getUserListThenSetUser();
            setIsLoggedIn(true);

            if (paramBookId) {
                const fetchBookData = async () => {
                    try {
                        const response = await fetch(`${Config.restApiUrl}/api/Book/GetById/${paramBookId}`);
                        const data = await response.json();
                        if (response.ok) {
                            setBookName(data.name);
                            setAuthorId(data.authorId);
                            setAvailable(data.available);
                            setUserId(data.userId);
                            setLenderId(currentUserId);
                            setLoanDuration(data.loanDuration);
                            setLoanDate(formatDate(data.loanDate));
                            setLoanEndDate(formatDate(data.loanEndDate));
                        } else {
                            alert('Failed to retrieve book data');
                        }
                    } catch (error) {
                        console.error('Error occurred while loading book data: ', error);
                        alert('Failed to load book data.');
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
        if (!available && userId == 0) {
            setErrorMessage("Borrower cannot be empty!");
        }
        else if (userId != 0 && loanDuration == 0) {
            setErrorMessage("Loan Duration is required");
        } else {
            if (!bookName.trim()) {
                setErrorMessage('Name cannot be empty!');
                return;
            }

            if (!authorId || authorId === "0") {
                alert('Please select an author!');
                return;
            }

            try {
                
                const response = await fetch(`${Config.restApiUrl}/api/Book/Update`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        bookId: paramBookId,
                        name: bookName,
                        authorId: authorId,
                        available: available,
                        userId: userId,
                        loanDuration: loanDuration,
                        lenderId: lenderId
                    }),
                });
                if (response.ok) {
                    navigate('/Book');
                } else {
                    const errorData = await response.json();
                    setErrorMessage(errorData.message);
                }
            } catch (error) {
                console.error('An error occurred while updating the book: ', error);
                setErrorMessage(error);
            }
        }
    };

    if (!isLoggedIn) {
        return null;
    }

    return (
        <div id="componentcontent" style={{ width: '100%', paddingTop: '4rem', paddingLeft: 0, paddingRight: 0 }}>
            <div className="display-6 text-danger">
                {errorMessage}
            </div>
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
                                    <option value="">Select an author</option>
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
                                        checked={available}
                                        onChange={(e) => availableChange(e.target.checked)}
                                    />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '20%' }}>
                                <label htmlFor="userList"><strong>Borrower</strong></label>
                            </td>
                            <td>
                                <select
                                    id="userList"
                                    className="form-control"
                                    value={userId || 0}
                                    onChange={(e) => userChange(e.target.value)}
                                >
                                    <option value="0">Select an User</option>
                                    {userList.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.firstName + ' ' + user.lastName}
                                        </option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '20%' }}>
                                <label htmlFor="loanDuration"><strong>Loan Duration (Day)</strong></label>
                            </td>
                            <td>
                                <input
                                    id="loanDuration"
                                    className="form-control"
                                    value={loanDuration}
                                    type="number"
                                    onChange={(e) => setLoanDuration(e.target.value)}
                                    placeholder="Enter the Loan Duration"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '20%' }}>
                                <label htmlFor="loanDate"><strong>Loan Date</strong></label>
                            </td>
                            <td>
                                <input
                                    id="loanData"
                                    disabled={true}
                                    className="form-control"
                                    value={loanDate || ''}
                                    type="text"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td style={{ width: '20%' }}>
                                <label htmlFor="loanEndDate"><strong>Loan End Date</strong></label>
                            </td>
                            <td>
                                <input
                                    id="loanEndDate"
                                    disabled={true}
                                    className="form-control"
                                    value={loanEndDate || ''}
                                    type="text"
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

export default BookUpdate;
