import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Config from '../config.json';

export function Message() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [apiResponseFormat, setApiResponseFormat] = useState('');
    const [fromModelList, setFromModelList] = useState([]);
    const [userList, setUserList] = useState([]);

    const [formData, setFormData] = useState({
        chat_id: '',
        text: ''
    });

    useEffect(() => {
        const getMessagesApiEndpointVal = Config.getMessagesApiEndpoint;
        const restApiUrlVal = Config.restApiUrl;
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsLoggedIn(true);
            getMessages(getMessagesApiEndpointVal);
            getUserList(restApiUrlVal);
        } else {
            setIsLoggedIn(false);
            navigate('/Login');
        }
    }, [navigate]);

    if (!isLoggedIn) {
        return null;
    }

    const handleChange = (e) => {
        setApiResponseFormat(null);
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    async function sendMessage(sendMessageApiEndpointVal, chatId, text) {
        const data = {
            chat_id: chatId,
            text: text
        };

        try {
            const response = await fetch(sendMessageApiEndpointVal, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            const jsonData = await response.json();
            if (response.ok && jsonData.result && jsonData.result.chat) {
                const responseFormat = jsonData.result.chat.first_name + ' ' + jsonData.result.chat.last_name + ' kullanicisina mesaj iletilmistir.';
                setApiResponseFormat(responseFormat);
            } else {
                console.error("Beklenen veri formatý gelmedi:", jsonData);
                setApiResponseFormat("Mesaj gönderilemedi.");
            }
        } catch (error) {
            console.error('Mesaj gönderilirken bir hata oluþtu:', error);
            setApiResponseFormat("Mesaj gönderilirken bir hata oluþtu.");
        }
    }

    async function getMessages(getMessagesApiEndpointVal) {
        try {
            const response = await fetch(getMessagesApiEndpointVal);
            const jsonData = await response.json();
            if (response.ok && jsonData.result) {
                var filteredMessage = jsonData.result.filter(msg => msg.message);
                setFromModelList(filteredMessage);
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
        <div style={{ width: '100%', paddingTop: '4rem', paddingLeft: 0, paddingRight: 0 }}>
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

            <div className="text-danger display-6">{apiResponseFormat}</div>

            {fromModelList.length > 0 ? (
                <div style={{ marginTop: '3rem' }}>
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Date</th>
                                <th>Name</th>
                                <th>SurName</th>
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
                <div>Loading...</div>
            )}
        </div>
    );
}

export default Message;
