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
import ChangePassword from './auth/ChangePassword'
import Staff from './pages/Staff/Staff'
import useAuth from './auth/useAuth'

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

const DashboardRoute = () => {
  const { session } = useAuth()
  return session.mustChangePassword ? <Navigate to="/change-password" replace /> : <Outlet />
}

const PermissionRoute = ({ permission, children }) => {
  const { session } = useAuth()
  return session.permissions.includes(permission) ? children : <Navigate to="/orders" replace />
}

const DashboardHome = () => {
  const { session } = useAuth()
  return <Navigate to={session.permissions.includes('catalog:write') ? '/featured' : '/orders'} replace />
}

const App = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000"

  return (
    <>
      <ToastContainer/>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/change-password" element={<ChangePassword />} />
          <Route element={<DashboardRoute />}>
            <Route element={<AdminLayout apiUrl={apiUrl} />}>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/featured" element={<PermissionRoute permission="catalog:write"><Page title="Featured Dishes"><Featured url={apiUrl} /></Page></PermissionRoute>} />
              <Route path="/add" element={<PermissionRoute permission="catalog:write"><Page title="Add Food"><Add url={apiUrl} /></Page></PermissionRoute>} />
              <Route path="/list" element={<PermissionRoute permission="catalog:write"><Page title="Food List"><List url={apiUrl} /></Page></PermissionRoute>} />
              <Route path="/orders" element={<Page title="Orders"><Orders url={apiUrl} /></Page>} />
              <Route path="/staff" element={<PermissionRoute permission="staff:manage"><Page title="Staff & Roles"><Staff /></Page></PermissionRoute>} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  )
}

export default App
