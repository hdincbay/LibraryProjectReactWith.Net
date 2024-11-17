import { useEffect, useState } from 'react';
import './Home.css';
import App from './App.jsx'
import Start from './Start.jsx'
import User from './User.jsx'
function Home() {
    return (

        <div>
            <div className="display-1 my-3 text-danger">Info Page</div>
            <div className="row">
                <div className="col-md-4">
                    <App />
                </div>
                <div className="col-md-4">
                    <Start />
                </div>
                <div className="col-md-4">
                    <User />
                </div>
            </div>
        </div>
    );
}

export default Home;
