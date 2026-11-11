import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import StoreContextProvider from './context/StoreContext.jsx'

//find out what this does and why we use it

document.head.querySelector('title')?.remove()

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
  <BrowserRouter>
    <StoreContextProvider>
      <App />
    </StoreContextProvider>
  </BrowserRouter>
  </HelmetProvider>
)
