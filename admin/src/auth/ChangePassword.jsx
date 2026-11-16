import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import api from './api'
import useAuth from './useAuth'
import PasswordInput from '../components/PasswordInput/PasswordInput'
import './Login.css'

export default function ChangePassword() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!session) return <Navigate to="/login" replace />

  async function submit(event) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api.post('/api/auth/password', { currentPassword, newPassword })
      logout()
      navigate('/login', { replace: true, state: { passwordChanged: true } })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not change password')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="admin-login">
      <form className="admin-login-card" onSubmit={submit}>
        <h1>Change your password</h1>
        <p>Replace your temporary password before accessing the dashboard.</p>
        <label htmlFor="current-password">Current password</label>
        <PasswordInput id="current-password" label="current password" autoComplete="current-password" required
          value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} />
        <label htmlFor="new-password">New password (12-72 UTF-8 bytes)</label>
        <PasswordInput id="new-password" label="new password" autoComplete="new-password" required
          value={newPassword} onChange={event => setNewPassword(event.target.value)} />
        {error && <p className="admin-login-error" role="alert">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Saving...' : 'Change password'}</button>
        <button type="button" onClick={logout}>Sign out</button>
      </form>
    </main>
  )
}
