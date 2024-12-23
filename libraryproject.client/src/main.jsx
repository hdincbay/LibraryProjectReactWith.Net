import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Book from './Book.jsx'
import Author from './Author.jsx'
import User from './User.jsx'
import { Routes, Route } from 'react-router-dom'
import First from './First.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <First />
  </BrowserRouter>
)
