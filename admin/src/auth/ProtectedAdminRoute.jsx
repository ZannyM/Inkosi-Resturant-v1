import { Navigate, Outlet } from 'react-router-dom'
import useAuth from './useAuth'

export default function ProtectedAdminRoute() {
  const { session } = useAuth()

  if (!session) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
