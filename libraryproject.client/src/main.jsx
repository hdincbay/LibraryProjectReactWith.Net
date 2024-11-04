import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Start from './Start.jsx'
import User from './User.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
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
  </StrictMode>
)
