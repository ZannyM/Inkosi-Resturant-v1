import Navbar from './components/Navbar/Navbar'
import Sidebar from './components/Sidebar/Sidebar'
import { Navigate, Outlet, Routes, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import Featured from './pages/Featured/Featured'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './auth/Login'
import ProtectedAdminRoute from './auth/ProtectedAdminRoute'

const Page = ({ title, children }) => (
  <>
    <Helmet><title>{`${title} | Inkosi Admin`}</title></Helmet>
    {children}
  </>
)

const AdminLayout = ({ apiUrl }) => (
  <>
    <Navbar url={apiUrl} />
    <div className="app-content">
      <Sidebar />
      <Outlet />
    </div>
  </>
)

const App = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000"

  return (
    <>
      <ToastContainer/>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route element={<AdminLayout apiUrl={apiUrl} />}>
            <Route path="/" element={<Navigate to="/featured" replace />} />
            <Route path="/featured" element={<Page title="Featured Dishes"><Featured url={apiUrl} /></Page>} />
            <Route path="/add" element={<Page title="Add Food"><Add url={apiUrl} /></Page>} />
            <Route path="/list" element={<Page title="Food List"><List url={apiUrl} /></Page>} />
            <Route path="/orders" element={<Page title="Orders"><Orders url={apiUrl} /></Page>} />
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
