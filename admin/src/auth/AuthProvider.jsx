import { useCallback, useEffect, useState } from 'react'
import api from './api'
import { AuthContext } from './AuthContext'

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null)

  const logout = useCallback(() => {
    delete api.defaults.headers.common.Authorization
    setSession(null)
  }, [])

  const login = useCallback(async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password })
    const { token, role, permissions, mustChangePassword, expiresIn } = response.data
    if (typeof role !== 'string' || !Array.isArray(permissions) ||
        !permissions.every(permission => typeof permission === 'string') ||
        typeof mustChangePassword !== 'boolean' || typeof token !== 'string' || !token ||
        !Number.isFinite(expiresIn) || expiresIn <= 0) {
      throw new Error('Invalid login response')
    }

    api.defaults.headers.common.Authorization = `Bearer ${token}`
    setSession({ role, permissions, mustChangePassword, expiresAt: Date.now() + expiresIn * 1000 })
    return { permissions, mustChangePassword }
  }, [])

  useEffect(() => {
    if (!session) return undefined
    const timer = setTimeout(logout, Math.max(0, session.expiresAt - Date.now()))
    return () => clearTimeout(timer)
  }, [session, logout])

  useEffect(() => {
    const id = api.interceptors.response.use(
      response => response,
      error => {
        const status = error.response?.status
        const sentAuthorization = error.config?.headers?.Authorization
        const currentAuthorization = api.defaults.headers.common.Authorization
        if (status === 401 && sentAuthorization &&
            sentAuthorization === currentAuthorization) {
          logout()
        }
        return Promise.reject(error)
      }
    )
    return () => api.interceptors.response.eject(id)
  }, [logout])

  return (
    <AuthContext.Provider value={{ session, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
