import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './User.css';
import Config from '../../config.json';
import { Link } from 'react-router-dom';
function User() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchTermId, setSearchTermId] = useState('');
    const [searchTermTchatId, setSearchTermTchatId] = useState('');
    const [searchTermFirstname, setSearchTermFirstname] = useState('');
    const [searchTermLastName, setSearchTermLastName] = useState('');
    const [searchTermUsername, setSearchTermUsername] = useState('');
    const [searchTermEmail, setSearchTermEmail] = useState('');

    const [sortConfig, setSortConfig] = useState({
        key: 'id',
        direction: 'ascending'
    });
    const authTokenVal = localStorage.getItem('authToken');
    const connectWebSocket = () => {
        var webSocketServerUrl = Config.webSocketUrl;
        const newSocket = new WebSocket(`${webSocketServerUrl}/UserList/`);

        newSocket.onopen = async () => {

            setAuthToken(authTokenVal);
            if (authTokenVal) {
                newSocket.send(JSON.stringify({ authToken: authTokenVal + '_user' }));
            }
        };

        newSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data) {
                    if (Array.isArray(data)) {
                        setUsers(data);
                    } else {
                        setUsers((prevUsers) => {
                            
                            const existingIds = new Set(prevUsers.map(user => user.id));
                            return [...prevUsers, data].filter(user => !existingIds.has(user.id));
                        });
                    }
                }
            } catch (e) {
                setError('Veri i?leme hatas?.');
            }
        };

        newSocket.onerror = (error) => {
            setError('WebSocket baglanti hatasi. Yeniden deniyor...');
        };

        newSocket.onclose = () => {
            setError('WebSocket baglantisi kapandi. Yeniden deniyor...');
            setTimeout(connectWebSocket, 5000);
        };

        setSocket(newSocket);
    };

    const deleteUser = async (event, userid) => {
        setLoading(true);
        try {
            setAuthToken(authToken);
            var restUrl = Config.restApiUrl;
            const response = await fetch(`${restUrl}/api/User/Delete/${userid}`, {
                method: 'DELETE',
                body: JSON.stringify({
                    authToken: authTokenVal + '_user'
                }),
            });
            const textResponse = await response.text();

            if (!response.ok) {
                throw new Error(textResponse);
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    const clearFilters = () => {
        setSearchTermId('');
        setSearchTermFirstname('');
        setSearchTermLastName('');
        setSearchTermUsername('');
        setSearchTermTchatId('');
        setSearchTermEmail('');
    };
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
            navigate('/Login');
        }
        connectWebSocket();
        return () => {
            if (socket) {
                socket.close();
            }
        };
    }, [navigate]);
    if (!isLoggedIn) {
        return null;
    }
    const filteredUsers = users.filter(user => {
        return (user.id.toString().includes(searchTermId.toString())) &&
            (user.t_chatId ? user.t_chatId.toLowerCase().includes(searchTermTchatId.toString().toLowerCase()) : true) &&
            (user.firstName ? user.firstName.toLowerCase().includes(searchTermFirstname.toLowerCase()) : true) &&
            (user.lastName ? user.lastName.toLowerCase().includes(searchTermLastName.toLowerCase()) : true) &&
            (user.userName ? user.userName.toLowerCase().includes(searchTermUsername.toLowerCase()) : true) &&
            (user.email ? user.email.toLowerCase().includes(searchTermEmail.toLowerCase()) : true)
        }
    );

    // Sorting books based on the selected key and direction
    const sortedUsers = filteredUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
    });
    const contents = error ? (
        <p><em>{error}</em></p>
    ) : sortedUsers.length === 0 ? (
        <p><em>User Undefined...</em></p>
    ) : (

        <table className="table" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th style={{ width: '10%' }}>ID</th>
                    <th style={{ width: '10%' }}>TChatID</th>
                    <th style={{ width: '15%' }}>User Name</th>
                    <th style={{ width: '20%' }}>Name</th>
                    <th style={{ width: '20%' }}>Last Name</th>
                    <th style={{ width: '10%' }}>Email</th>
                    <th style={{ width: '15%' }}>#</th>
                </tr>
            </thead>
            <tbody>
                {sortedUsers.map(user => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.t_chatId}</td>
                        <td>{user.userName}</td>
                        <td>{user.firstName}</td>
                        <td>{user.lastName}</td>
                        <td>{user.email}</td>
                        <td>
                            <div className="col-md-8 offset-md-2" style={{ display: 'flex', flexDirection: 'column' }}>
                                <Link
                                    className="btn btn-primary"
                                    to={`/UserUpdate/${user.id}`}
                                    style={{
                                        height: '2.5rem', // Ayn? yükseklik
                                        display: 'flex',  // Flexbox
                                        alignItems: 'center', // ?çeri?i dikeyde ortala
                                        justifyContent: 'center', // ?çeri?i yatayda ortala
                                        padding: '0 1rem' // Buton içeri?i için sa? ve sol padding
                                    }}
                                >
                                    <i className="fa-solid fa-pen-nib"></i>&nbsp;Update
                                </Link>
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={(event) => deleteUser(event, user.userId)}
                                    disabled={loading}
                                    style={{
                                        height: '2.5rem', // Ayn? yükseklik
                                        display: 'flex',  // Flexbox
                                        alignItems: 'center', // ?çeri?i dikeyde ortala
                                        justifyContent: 'center', // ?çeri?i yatayda ortala
                                        padding: '0 1rem' // Buton içeri?i için sa? ve sol padding
                                    }}
                                >
                                    <i className="fa fa-trash"></i>&nbsp;{loading ? 'Removed...' : 'Remove'}
                                </button>
                            </div>

                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div id="componentcontent">
            <div className="d-flex justify-content-end">
                <a className="btn btn-outline-danger" onClick={clearFilters}><i className="fa-solid fa-filter-circle-xmark"></i> Clear Filters</a>
                <Link to="/UserCreate" className="nav-link">
                    <div className="btn btn-outline-success mx-2"><i className="fa-solid fa-plus"></i> User Create</div>
                </Link>
            </div>
            <h1 id="tableLabel">User List</h1>
            <table className="table" aria-labelledby="tableLabel">
                <thead>
                    <tr id="tableheadsearch">
                        <th style={{ width: '10%' }}>
                            <input
                                type="text"
                                className="form-control mx-2 col-md-2"
                                placeholder="Search by ID"
                                value={searchTermId}
                                onChange={(e) => setSearchTermId(e.target.value)}
                            />
                        </th>
                        <th style={{ width: '10%' }}>
                            <input
                                type="text"
                                className="form-control mx-2 col-md-2"
                                placeholder="Search by TChatID"
                                value={searchTermTchatId}
                                onChange={(e) => setSearchTermTchatId(e.target.value)}
                            />
                        </th>
                        <th style={{ width: '15%' }}>
                            <input
                                type="text"
                                className="form-control mx-2 col-md-2"
                                placeholder="Search by UserName"
                                value={searchTermUsername}
                                onChange={(e) => setSearchTermUsername(e.target.value)}
                            />
                        </th>
                        <th style={{ width: '20%' }}>
                            <input
                                type="text"
                                className="form-control mx-2"
                                value={searchTermFirstname}
                                placeholder="Search by Name"
                                onChange={(e) => setSearchTermFirstname(e.target.value)}
                            />
                        </th>
                        <th style={{ width: '20%' }}>
                            <input
                                type="text"
                                className="form-control mx-2"
                                value={searchTermLastName}
                                placeholder="Search by LastName"
                                onChange={(e) => setSearchTermLastName(e.target.value)}
                            />
                        </th>
                        <th style={{ width: '10%' }}>
                            <input
                                type="text"
                                className="form-control mx-2"
                                value={searchTermEmail}
                                placeholder="Search by Email"
                                onChange={(e) => setSearchTermEmail(e.target.value)}
                            />
                        </th>
                        <th style={{ width: '15%' }}>

                        </th>
                    </tr>
                </thead>
            </table>
            {contents}
        </div>
    );
}

export default User;