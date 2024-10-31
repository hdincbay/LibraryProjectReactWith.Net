import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Start from './Start.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <div className="row">
            <div className="col-md-6">
                <App />
            </div>
            <div className="col-md-6">
                <Start />
            </div>
        </div>
  </StrictMode>,
)
