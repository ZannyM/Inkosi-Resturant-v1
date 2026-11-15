import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import AuthProvider from './auth/AuthProvider'

document.head.querySelector('title')?.remove()

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
  </HelmetProvider>


)
