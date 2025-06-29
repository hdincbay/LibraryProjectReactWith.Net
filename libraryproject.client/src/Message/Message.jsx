import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Config from '../../config.json';

export function Message() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [fromModelList, setFromModelList] = useState([]);
    const [userList, setUserList] = useState([]);
    const [formData, setFormData] = useState({
        chat_id: '',
        text: ''
    });

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
                    const getMessagesApiEndpointVal = Config.getMessagesApiEndpoint;
                    setIsLoggedIn(true);
                    getUserList(restUrl);
                    const intervalId = setInterval(() => {
                        getMessages(getMessagesApiEndpointVal);
                    }, 5000);

                    return () => clearInterval(intervalId);
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    async function sendMessage(sendMessageApiEndpointVal, chatId, text) {
        const restApiUrlVal = Config.restApiUrl;
        const data = {
            endpoint: sendMessageApiEndpointVal,
            requestBody: {
                chat_id: chatId,
                text: text
            }
        };

        try {
            const response = await fetch(`${restApiUrlVal}/api/Message/PublishMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                setFormData({
                    chat_id: '',
                    text: ''
                });
            } else {
                console.error("Beklenen veri formatý gelmedi:", jsonData);
            }
        } catch (error) {
            console.error('Mesaj gönderilirken bir hata oluþtu:', error);
        }
    }

    async function getMessages(getMessagesApiEndpointVal) {
        try {
            const response = await fetch(getMessagesApiEndpointVal);
            const jsonData = await response.json();

            if (response.ok && jsonData.result) {
                const filteredMessage = jsonData.result.filter(msg => msg.message);
                if (JSON.stringify(filteredMessage) !== JSON.stringify(fromModelList)) {
                    setFromModelList(filteredMessage);
                }
            } else {
                setFromModelList([]);
                console.error("Mesajlar alýnýrken bir hata oluþtu:", jsonData);
            }
        } catch (error) {
            console.error('Mesajlar alýnýrken bir hata oluþtu:', error);
            setFromModelList([]);
        }
    }

    async function getUserList(restApiUrlVal) {
        try {
            const response = await fetch(`${restApiUrlVal}/api/User/GetAll`);
            const jsonData = await response.json();
            const filteredUserList = jsonData.filter(user => user.t_chatId);
            setUserList(filteredUserList);
        } catch (error) {
            console.error('Kullanýcý listesi alýnýrken bir hata oluþtu:', error);
            setUserList([]);
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.chat_id || !formData.text) {
            alert("Lütfen tüm alanlarý doldurun.");
            return;
        }
        const sendMessageApiEndpointVal = Config.sendMessageApiEndpoint;
        await sendMessage(sendMessageApiEndpointVal, formData.chat_id, formData.text);
    };

    return (
        <div id="componentcontent" style={{ width: '100%', paddingTop: '4rem' }}>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <select
                        id="chat_id"
                        name="chat_id"
                        value={formData.chat_id}
                        onChange={handleChange}
                        className="form-control my-2"
                        required
                    >
                        <option value="">Select User</option>
                        {userList.length > 0 ? (
                            userList.map((user) => (
                                <option key={user.t_chatId} value={user.t_chatId}>
                                    {user.firstName || 'No First Name'} {user.lastName || 'No Last Name'}
                                </option>
                            ))
                        ) : (
                            <option disabled>Loading users...</option>
                        )}
                    </select>
                </div>
                <div className="form-group my-2">
                    <textarea
                        className="form-control"
                        id="text"
                        name="text"
                        value={formData.text}
                        onChange={handleChange}
                        rows="4"
                        cols="50"
                        placeholder="Enter your message here..."
                    />
                </div>
                <button className="btn btn-primary" type="submit">
                    <i className="fa-brands fa-telegram fa-l"></i>&nbsp;&nbsp;Send
                </button>
            </form>

            {fromModelList.length > 0 ? (
                <div>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Date</th>
                                <th>Name</th>
                                <th>Surname</th>
                                <th>Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fromModelList.map((fromModel, index) => {
                                const message = fromModel.message || {};
                                const date = message.date ? new Date(message.date * 1000).toLocaleString() : 'Unknown Date';
                                const firstName = message.from ? message.from.first_name : 'No First Name';
                                const lastName = message.from ? message.from.last_name : 'No Last Name';
                                const text = message.text || 'No Message';

                                return (
                                    <tr key={message.message_id}>
                                        <td>{index + 1}</td>
                                        <td>{date}</td>
                                        <td>{firstName}</td>
                                        <td>{lastName}</td>
                                        <td>{text}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div>No messages available.</div>
            )}
        </div>
    );
}

export default Message;
