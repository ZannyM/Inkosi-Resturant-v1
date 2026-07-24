import React from 'react'
import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Navigate, Routes,Route } from 'react-router-dom'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import Featured from './pages/Featured/Featured'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {

const apiUrl = "http://localhost:4000"

  return (
    <div>
      <ToastContainer/>
      <Navbar url={apiUrl} />
      <div className="app-content">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Navigate to="/featured" replace />} />
          <Route path="/featured" element={<Featured url={apiUrl} />} />
          <Route path="/add" element={<Add url={apiUrl} />} />
          <Route path="/list" element={<List url={apiUrl} />} />
          <Route path="/orders" element={<Orders url={apiUrl} />} />
        </Routes>
      </div>
      
    </div>
  )
}

export default App
