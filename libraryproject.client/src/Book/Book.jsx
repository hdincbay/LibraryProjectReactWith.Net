import { useEffect, useState } from 'react';
import './Book.css';
import Config from '../../config.json';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Book() {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authToken, setAuthToken] = useState(null);
    const [authorName, setAuthorName] = useState('');
    const [searchTermName, setSearchTermName] = useState('');  // Book name search
    const [searchTermAuthor, setSearchTermAuthor] = useState('');  // Author name search
    const [searchTermSerial, setSearchTermSerial] = useState('');  // Serial number search
    const [searchTermAvailable, setSearchTermAvailable] = useState('');  // Availability search
    const authTokenVal = localStorage.getItem('authToken');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [sortConfig, setSortConfig] = useState({
        key: 'bookId',  // Default sorting by ID
        direction: 'ascending'
    });

    function formatDate(dateStr) {
        let date = new Date(dateStr);
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth() + 1).padStart(2, '0');
        let year = date.getFullYear();
        let hours = String(date.getHours()).padStart(2, '0');
        let minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    const getAuthorName = async (authorIdVal) => {
        var restUrl = Config.restApiUrl;
        const response = await fetch(`${restUrl}/api/Author/GetById/${authorIdVal}`, {
            method: 'GET'
        });
        const textResponse = await response.text();
        try {
            const jsonResponse = JSON.parse(textResponse);
            return jsonResponse.name + ' ' + jsonResponse.surname;
        } catch (error) {
            console.error('JSON parse error:', error);
        }
    };

    const connectWebSocket = () => {
        var webSocketServerUrl = Config.webSocketUrl;
        const newSocket = new WebSocket(`${webSocketServerUrl}/BookList/`);

        newSocket.onopen = () => {
            setAuthToken(authTokenVal);
            if (authTokenVal) {
                newSocket.send(JSON.stringify({ authToken: authTokenVal + '_book' }));
            }
        };

        newSocket.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data != null && data != [] && data != "") {
                    if (Array.isArray(data)) {
                        for (let item of data) {
                            item.authorId = await getAuthorName(item.authorId);
                            item.createdDate = formatDate(item.createdDate);
                        }
                        setBooks(data);
                    } else {
                        setBooks(prevBooks => {
                            const existingIds = new Set(prevBooks.map(book => book.bookId));
                            return [...prevBooks, data].filter(book => !existingIds.has(book.bookId));
                        });
                    }
                }
            } catch (e) {
                setError('Data processing error.');
            }
        };

        newSocket.onerror = (error) => {
            setError('WebSocket connection error. Retrying...');
        };

        newSocket.onclose = () => {
            setError('WebSocket connection closed. Retrying...');
            setTimeout(connectWebSocket, 5000);
        };

        setSocket(newSocket);
    };

    const deleteBook = async (event, bookid) => {
        setLoading(true);
        try {
            setAuthToken(authToken);
            var restUrl = Config.restApiUrl;
            const response = await fetch(`${restUrl}/api/Book/Delete/${bookid}`, {
                method: 'DELETE',
                body: JSON.stringify({
                    authToken: authTokenVal + '_book'
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

    // Filtered books
    const filteredBooks = books.filter(book =>
        (book.name.toLowerCase().includes(searchTermName.toLowerCase())) &&
        (book.authorId.toLowerCase().includes(searchTermAuthor.toLowerCase())) &&
        (book.serialNumber.toLowerCase().includes(searchTermSerial.toLowerCase())) &&
        (book.available.toString().includes(searchTermAvailable.toLowerCase()))
    );

    // Sorting books based on the selected key and direction
    const sortedBooks = filteredBooks.sort((a, b) => {
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
    ) : sortedBooks.length === 0 ? (
        <p><em>Author Undefined...</em></p>
    ) : (
        <table className="table" aria-labelledby="tableLabel">
            <thead>
                
                <tr>
                    <th onClick={() => handleSort('bookId')}>ID</th>
                    <th onClick={() => handleSort('createdDate')}>Created Date</th>
                    <th onClick={() => handleSort('serialNumber')}>Serial Number</th>
                    <th onClick={() => handleSort('available')}>Available</th>
                    <th onClick={() => handleSort('name')}>Name</th>
                    <th onClick={() => handleSort('authorId')}>Author Name</th>
                    <th>#</th>
                </tr>
            </thead>
            <tbody>
                {sortedBooks.map(book => (
                    <tr key={book.bookId}>
                        <td>{book.bookId}</td>
                        <td>{book.createdDate}</td>
                        <td>{book.serialNumber}</td>
                        <td>{book.available.toString()}</td>
                        <td>{book.name}</td>
                        <td>{book.authorId}</td>
                        <td>
                            <div className="col-md-8 offset-md-2" style={{ display: 'flex', flexDirection: 'column' }}>
                                <Link
                                    className="btn btn-primary"
                                    to={`/BookUpdate/${book.bookId}`}
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
                                    onClick={(event) => deleteBook(event, book.bookId)}
                                    disabled={loading}
                                    style={{
                                        height: '2.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0 1rem'
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
        <div id="componentcontent" style={{ width: '100%', paddingLeft: 0, paddingRight: 0 }}>
            <div className="d-flex justify-content-end">
                <Link to="/BookCreate" className="nav-link">
                    <div className="btn btn-outline-success mx-2"><i className="fa-solid fa-plus"></i> Book Create</div>
                </Link>
            </div>
            <h1 id="tableLabel">Book List</h1>

            <table className="table" aria-labelledby="tableLabel">
                <thead>
                    <tr id="tableheadsearch">
                        <th>
                            <input
                                type="text"
                                className="form-control mx-2 col-md-2"
                                placeholder="Search by Name"
                                value={searchTermName}
                                onChange={(e) => setSearchTermName(e.target.value)}
                            />
                        </th>
                        <th>
                            <input
                                type="datetime-local"
                                className="form-control mx-2 col-md-2"
                                placeholder="Search by Name"
                                value={searchTermName}
                                onChange={(e) => setSearchTermName(e.target.value)}
                            />
                        </th>
                        <th>
                            <input
                                type="text"
                                className="form-control mx-2 col-md-2"
                                placeholder="Search by Name"
                                value={searchTermName}
                                onChange={(e) => setSearchTermName(e.target.value)}
                            />
                        </th>
                        <th>
                            <input
                                type="text"
                                className="form-control mx-2 col-md-2"
                                placeholder="Search by Serial Number"
                                value={searchTermSerial}
                                onChange={(e) => setSearchTermSerial(e.target.value)}
                            />
                        </th>
                        <th>
                            <input
                                type="text"
                                className="form-control mx-2"
                                placeholder="Search by Availability"
                                value={searchTermAvailable}
                                onChange={(e) => setSearchTermAvailable(e.target.value)}
                            />
                        </th>
                        <th>
                            <input
                                type="text"
                                className="form-control mx-2"
                                placeholder="Search by Availability"
                                value={searchTermAvailable}
                                onChange={(e) => setSearchTermAvailable(e.target.value)}
                            />
                        </th>
                    </tr>
                </thead>
            </table>
            {contents}
        </div>
    );
}

export default Book;
