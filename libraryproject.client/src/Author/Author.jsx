import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Author.css';
import Config from '../../config.json';
import { Link } from 'react-router-dom';
function Author() {
    const navigate = useNavigate();
    const [authors, setAuthors] = useState([]);
    const [error, setError] = useState(null);
    const [authToken, setAuthToken] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [searchTermId, setSearchTermId] = useState('');
    const [searchTermName, setSearchTermName] = useState('');
    const [searchTermSurname, setSearchTermSurname] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({
        key: 'authorId',
        direction: 'ascending'
    });
    const socketRef = useRef(null);
    const authTokenVal = localStorage.getItem('authToken');
    const connectWebSocket = () => {
        if (socketRef.current) {
            return;
        }
        var webSocketServerUrl = Config.webSocketUrl;
        const newSocket = new WebSocket(`${webSocketServerUrl}/AuthorList/`);

        newSocket.onopen = () => {
            setAuthToken(authTokenVal);
            if (authTokenVal) {
                newSocket.send(JSON.stringify({ authToken: authTokenVal + '_author' }));
            }
        };

        newSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data != null || data != [] || data != "")
                {
                    if (Array.isArray(data)) {
                        setAuthors(data);
                    } else {
                        setAuthors(prevAuthors => {
                            const existingIds = new Set(prevAuthors.map(author => author.authorId));
                            return [...prevAuthors, data].filter(author => !existingIds.has(author.authorId));
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
    const deleteAuthor = async (event, authorid) => {
        try {
            setAuthToken(authToken);
            var restUrl = Config.restApiUrl;
            const response = await fetch(`${restUrl}/api/Author/Delete/${authorid}`, {
                method: 'DELETE',
                body: JSON.stringify({
                    authToken: authTokenVal + '_author'
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
        setSearchTermName('');
        setSearchTermSurname('');
    };
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
            navigate('/Login');
        }
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
    const filteredAuthors = authors.filter(author => {
        return (author.authorId.toString().includes(searchTermId.toString())) &&
            (author.name.toLowerCase().includes(searchTermName.toLowerCase())) &&
            (author.surname.toLowerCase().includes(searchTermSurname.toLowerCase()))
        }
    );

    const sortedAuthors = filteredAuthors.sort((a, b) => {
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
                <i className="fas fa-spinner fa-spin fa-3x"></i>
            </div>
    ): (sortedAuthors.length === 0 ? (
                <p>No records found.</p>
    ) : (
        <table className="table" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th style={{ width: '10%' }} onClick={() => handleSort('authorId')}>ID</th>
                    <th style={{ width: '30%' }} onClick={() => handleSort('name')}>Name</th>
                    <th style={{ width: '30%' }} onClick={() => handleSort('surname')}>Surname</th>
                    <th style={{ width: '30%' }}>#</th>
                </tr>
            </thead>
            <tbody>
                {sortedAuthors.map(author => (
                    <tr key={author.authorId}>
                        <td>{author.authorId}</td>
                        <td>{author.name}</td>
                        <td>{author.surname}</td>
                        <td>
                            <div className="col-md-4 offset-md-4" style={{ display: 'flex', flexDirection: 'column' }}>
                                <Link
                                    className="btn btn-primary"
                                    to={`/AuthorUpdate/${author.authorId}`}
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
                                    onClick={(event) => deleteAuthor(event, author.authorId)}
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
    ));

    return (
        <div id="componentcontent">
            <div className="d-flex justify-content-end">
                <a className="btn btn-outline-danger" onClick={clearFilters}><i className="fa-solid fa-filter-circle-xmark"></i> Clear Filters</a>
                <Link to="/AuthorCreate" className="nav-link">
                    <div className="btn btn-outline-success mx-2"><i className="fa-solid fa-plus"></i> Author Create</div>
                </Link>
            </div>
            <h1 id="tableLabel">Author List</h1>
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
                        <th style={{ width: '30%' }}>
                            <input
                                type="text"
                                className="form-control mx-2"
                                value={searchTermName}
                                placeholder="Search by Name"
                                onChange={(e) => setSearchTermName(e.target.value)}
                            />
                        </th>
                        <th style={{ width: '30%' }}>
                            <input
                                type="text"
                                className="form-control mx-2"
                                value={searchTermSurname}
                                placeholder="Search by Surname"
                                onChange={(e) => setSearchTermSurname(e.target.value)}
                            />
                        </th>
                        <th style={{ width: '30%' }}>
                            
                        </th>
                    </tr>
                </thead>
            </table>
            {contents}
        </div>
    );
}

export default Author;
