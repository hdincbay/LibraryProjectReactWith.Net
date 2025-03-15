import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Config from '../../config.json';
import './User.css';

function UserUpdate() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [userName, setUserName] = useState('');
    const [tchatId, setTChatId] = useState('');
    const [bookList, setBookList] = useState([]);

    function formatDuration(duration) {
        let hours = Math.floor(duration / 3600);
        duration %= 3600;
        let minutes = Math.floor(duration / 60);
        let seconds = duration % 60;
        hours = String(hours).padStart(2, '0');
        minutes = String(minutes).padStart(2, '0');
        seconds = String(seconds).padStart(2, '0');
        let formattedTime = `${hours}:${minutes}:${seconds}`;
        return formattedTime;
    }
    function formatDate(dateStr) {
        let date = new Date(dateStr);
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let year = date.getFullYear();
        let hours = String(date.getHours()).padStart(2, '0');
        let minutes = String(date.getMinutes()).padStart(2, '0');
        let result = `${day}/${month}/${year} ${hours}:${minutes}`;
        return result === "01/01/1970 02:00" ? '' : result;
    }

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/Login');
            return;
        }
        setIsLoggedIn(true);

        const fetchUserData = async () => {
            try {
                const response = await fetch(`${Config.restApiUrl}/api/User/GetOne/${userId}`);
                if (!response.ok) throw new Error('Failed to retrieve user information.');

                const userData = await response.json();
                setFirstName(userData.FirstName);
                setLastName(userData.LastName);
                setEmailAddress(userData.Email);
                setUserName(userData.UserName);
                setTChatId(userData.t_chatId);
            } catch (error) {
                alert(error.message);
            }
        };

        const getBookListByUser = async () => {
            try {
                const response = await fetch(`${Config.restApiUrl}/api/User/GetBookListByUserId/${userId}`);
                if (!response.ok) throw new Error('Failed to retrieve book list.');

                const jsonResponse = await response.json();
                setBookList(jsonResponse.map(item => ({
                    ...item,
                    slaDuration: formatDuration(item.slaDuration),
                    loanDate: formatDate(item.loanDate),
                    loanEndDate: formatDate(item.loanEndDate),
                })));
            } catch (error) {
                alert(error.message);
            }
        };

        fetchUserData();
        getBookListByUser();
    }, [userId, navigate]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!userName.trim()) {
            alert('Username cannot be empty!');
            return;
        }
        try {
            const response = await fetch(`${Config.restApiUrl}/api/User/Update/${userId}`, {
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
                alert(`Error: ${errorData.message || 'User update failed!'}`);
            }
        } catch (error) {
            console.error('An error occurred while updating the user:', error);
            alert('An error occurred, please try again.');
        }
    };

    return isLoggedIn ? (
        <div id="componentcontent" style={{ width: '100%', paddingTop: '4rem' }}>
            <form onSubmit={handleSubmit}>
                <table style={{ width: '100%' }}>
                    <tbody>
                        <tr>
                            <td><strong>First Name</strong></td>
                            <td><input className="form-control" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></td>
                        </tr>
                        <tr>
                            <td><strong>Last Name</strong></td>
                            <td><input className="form-control" value={lastName} onChange={(e) => setLastName(e.target.value)} /></td>
                        </tr>
                        <tr>
                            <td><strong>User Name</strong></td>
                            <td><input className="form-control" value={userName} onChange={(e) => setUserName(e.target.value)} /></td>
                        </tr>
                        <tr>
                            <td><strong>Email</strong></td>
                            <td><input className="form-control" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} /></td>
                        </tr>
                        <tr>
                            <td><strong>Chat ID</strong></td>
                            <td><input className="form-control" value={tchatId} onChange={(e) => setTChatId(e.target.value)} /></td>
                        </tr>
                        <tr>
                            <td></td>
                            <td><button className="btn btn-success">Submit</button></td>
                        </tr>
                    </tbody>
                </table>
            </form>
            {bookList.length > 0 && (
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Book Name</th>
                            <th>Loan Date</th>
                            <th>Loan End Date</th>
                            <th>SLA Expire</th>
                            <th>Remaining Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookList.map(book => (
                            <tr key={book.bookId}>
                                <td>{book.bookId}</td>
                                <td>{book.name}</td>
                                <td>{book.loanDate}</td>
                                <td>{book.loanEndDate}</td>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        defaultChecked={book.sla}
                                    />
                                </td>
                                <td>{book.slaDuration}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    ) : <div className="text-center">Redirecting to Login...</div>;
}

export default UserUpdate;
