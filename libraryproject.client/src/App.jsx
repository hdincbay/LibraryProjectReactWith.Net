import { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [forecasts, setForecasts] = useState();

    useEffect(() => {
        bookList();
    }, []);

    const contents = forecasts === undefined
        ? <p><em>Loading... Please refresh once the ASP.NET backend has started. See <a href="https://aka.ms/jspsintegrationreact">https://aka.ms/jspsintegrationreact</a> for more details.</em></p>
        : <table className="table table-striped" aria-labelledby="tableLabel">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Serial No</th>
                    <th>Available</th>
                </tr>
            </thead>
            <tbody>
                {forecasts.map(forecast =>
                    <tr key={forecast.bookId}>
                        <td>{forecast.bookId}</td>
                        <td>{forecast.name}</td>
                        <td>{forecast.serialNumber}</td>
                        <td>{forecast.available}</td>
                    </tr>
                )}
            </tbody>
        </table>;

    return (
        <div>
            <h1 id="tableLabel">Book List</h1>
            {contents}
        </div>
    );
    
    async function bookList() {
        const response = await fetch('https://localhost:7275/api/Book/GetAll');
        const data = await response.json();
        setForecasts(data);
    }
}

export default App;