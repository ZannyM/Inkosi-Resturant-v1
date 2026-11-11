import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Navigate, Routes,Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import Featured from './pages/Featured/Featured'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Page = ({ title, children }) => (
  <>
    <Helmet><title>{`${title} | Inkosi Admin`}</title></Helmet>
    {children}
  </>
)

const App = () => {

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000"

  return (
    <div>
      <ToastContainer/>
      <Navbar url={apiUrl} />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Navigate to="/featured" replace />} />
          <Route path="/featured" element={<Page title="Featured Dishes"><Featured url={apiUrl} /></Page>} />
          <Route path="/add" element={<Page title="Add Food"><Add url={apiUrl} /></Page>} />
          <Route path="/list" element={<Page title="Food List"><List url={apiUrl} /></Page>} />
          <Route path="/orders" element={<Page title="Orders"><Orders url={apiUrl} /></Page>} />
        </Routes>
      </div>
      
    </div>
  )
}

export default App
