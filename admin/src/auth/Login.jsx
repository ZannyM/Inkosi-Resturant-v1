import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import useAuth from './useAuth'
import PasswordInput from '../components/PasswordInput/PasswordInput'
import './Login.css'

export default function Login() {
  const { session, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to={session.mustChangePassword ? '/change-password' :
    session.permissions.includes('catalog:write') ? '/featured' : '/orders'} replace />

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      const result = await login(email, password)
      setPassword('')
      navigate(result.mustChangePassword ? '/change-password' :
        result.permissions.includes('catalog:write') ? '/featured' : '/orders', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="admin-login">
      <Helmet><title>Sign in | Inkosi Admin</title></Helmet>
      <form className="admin-login-card" onSubmit={submit}>
        <p className="admin-login-brand">Inkosi Restaurant</p>
        <h1>Admin sign in</h1>
        <p className="admin-login-description">Sign in to manage your restaurant.</p>
        {location.state?.passwordChanged && <p>Your password was changed. Please sign in again.</p>}
        <label htmlFor="admin-email">Email</label>
        <input id="admin-email" type="email" autoComplete="username" value={email}
          onChange={event => setEmail(event.target.value)} required />
        <label htmlFor="admin-password">Password</label>
        <PasswordInput id="admin-password" autoComplete="current-password" value={password}
          onChange={event => setPassword(event.target.value)} required />
        {error && <p className="admin-login-error" role="alert">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
        <p className="admin-login-help">Need access? Contact the restaurant administrator.</p>
      </form>
    </main>
  )
}
