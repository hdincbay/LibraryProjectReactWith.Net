import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import First from './First.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <First />
  </BrowserRouter>
)
