import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './User.css';
import Config from '../../config.json';
import { Link } from 'react-router-dom';
function User() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchTermId, setSearchTermId] = useState('');
    const [searchTermTchatId, setSearchTermTchatId] = useState('');
    const [searchTermBookCount, setSearchBookCount] = useState('');
    const [searchTermFirstname, setSearchTermFirstname] = useState('');
    const [searchTermLastName, setSearchTermLastName] = useState('');
    const [searchTermUsername, setSearchTermUsername] = useState('');
    const [searchTermEmail, setSearchTermEmail] = useState('');
    const [loading, setLoading] = useState(true);

    const [sortConfig, setSortConfig] = useState({
        key: 'id',
        direction: 'ascending'
    });
    const socketRef = useRef(null);
    const authTokenVal = localStorage.getItem('authToken');
    const connectWebSocket = () => {
        if (socketRef.current) {
            return;
        }
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
                        const filteredUsers = data.filter(user => user.normalizedUserName !== 'SYSTEMUSER');
                        setUsers(filteredUsers);
                    } else {
                        setUsers((prevUsers) => {
                            
                            const existingIds = new Set(prevUsers.map(user => user.id));
                            return [...prevUsers, data].filter(user => !existingIds.has(user.id));
                        });
                    }
                    setLoading(false);
                }
            } catch (e) {
                setError('Data processing error!');
            }
        };

        newSocket.onerror = (error) => {
            setError('WebSocket connection error. Retrying...');
            setLoading(false);
        };

        newSocket.onclose = () => {
            setError('WebSocket connection closed. Retrying...');
            setTimeout(connectWebSocket, 5000);
            setLoading(false);
        };

        socketRef.current = newSocket;
    };
    

    const deleteUser = async (event, userid) => {
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
        if (!socketRef.current) {
            connectWebSocket();
        }
        return () => {
            if (socketRef.current) {
                socketRef.current.close();
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
            (user.bookCount.toString().includes(searchTermBookCount)) &&
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
    ) : loading ? (
            <div style={{ textAlign: "center", marginTop: "50px" }}>
                <i className="fas fa-spinner fa-spin fa-2x"></i>
            </div>
    ): sortedUsers.length === 0 ? (
                <p>No records found.</p>
    ) : (

        <table className="table" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th style={{ width: '10%' }}>ID</th>
                    <th style={{ width: '10%' }}>TChatID</th>
                    <th style={{ width: '5%' }}>Book Count</th>
                    <th style={{ width: '10%' }}>User Name</th>
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
                        <td>{user.bookCount}</td>
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
                                        height: '2.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0 1rem'
                                    }}
                                >
                                    <i className="fa-solid fa-pen-nib"></i>&nbsp;Update
                                </Link>
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={(event) => deleteUser(event, user.id)}
                                    style={{
                                        height: '2.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0 1rem'
                                    }}
                                >
                                    <i className="fa fa-trash"></i>&nbsp;Remove
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
                        <th style={{ width: '5%' }}>
                            <input
                                type="text"
                                className="form-control mx-2 col-md-2"
                                placeholder="Search by Book Count"
                                value={searchTermBookCount}
                                onChange={(e) => setSearchBookCount(e.target.value)}
                            />
                        </th>
                        <th style={{ width: '10%' }}>
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