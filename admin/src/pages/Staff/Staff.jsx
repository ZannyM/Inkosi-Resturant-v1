import { useEffect, useRef, useState } from 'react'
import api from '../../auth/api'
import './Staff.css'

function AddAdminModal({ roles, onClose, onCreated }) {
  const dialog = useRef(null)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState(roles[0]?._id || '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    dialog.current.showModal()
  }, [])

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await api.post('/api/staff', { username, email, password, roleId })
      await onCreated()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create staff account')
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog ref={dialog} onClose={onClose} className="staff-dialog" aria-labelledby="add-staff-title">
      <form onSubmit={submit}>
        <h2 id="add-staff-title">Add admin user</h2>
        <label htmlFor="staff-username">Username</label>
        <input id="staff-username" value={username} onChange={event => setUsername(event.target.value)} maxLength={50} required />
        <label htmlFor="staff-email">Email</label>
        <input id="staff-email" type="email" value={email} onChange={event => setEmail(event.target.value)} maxLength={100} required />
        <label htmlFor="staff-password">Temporary password (12-72 UTF-8 bytes)</label>
        <input id="staff-password" type="password" autoComplete="new-password" value={password}
          onChange={event => setPassword(event.target.value)} required />
        <label htmlFor="staff-role">Role</label>
        <select id="staff-role" value={roleId} onChange={event => setRoleId(event.target.value)} required>
          {roles.map(role => <option key={role._id} value={role._id}>{role.name}</option>)}
        </select>
        <p>They must change their password on first sign-in.</p>
        {error && <p role="alert" className="staff-error">{error}</p>}
        <div className="staff-actions">
          <button type="button" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" disabled={busy || !roleId}>{busy ? 'Creating...' : 'Create user'}</button>
        </div>
      </form>
    </dialog>
  )
}

export default function Staff() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [updating, setUpdating] = useState('')

  async function loadUsers() {
    const response = await api.get('/api/staff')
    setUsers(response.data.users)
  }

  useEffect(() => {
    async function load() {
      try {
        const [usersResponse, rolesResponse] = await Promise.all([
          api.get('/api/staff'), api.get('/api/staff/roles')
        ])
        setUsers(usersResponse.data.users)
        setRoles(rolesResponse.data.roles)
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load staff')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function toggle(user) {
    setUpdating(user._id)
    setError('')
    try {
      await api.patch(`/api/staff/${user._id}/status`, { isActive: !user.isActive })
      await loadUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update staff status')
    } finally {
      setUpdating('')
    }
  }

  return (
    <section className="staff-page">
      <div className="staff-heading">
        <h1>Staff &amp; Roles Management</h1>
        <button type="button" onClick={() => setModalOpen(true)} disabled={loading || roles.length === 0}>Add admin user</button>
      </div>
      <p>Manager: full access. Kitchen Staff: view and update orders.</p>
      {error && <p role="alert" className="staff-error">{error}</p>}
      {loading ? <p>Loading staff...</p> : (
        <div className="staff-table-wrap">
          <table>
            <thead><tr><th>Username</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>{users.map(user => (
              <tr key={user._id}>
                <td>{user.username}</td><td>{user.email}</td><td>{user.role?.name || 'Role unavailable'}</td>
                <td><label>
                  <input type="checkbox" role="switch" checked={user.isActive}
                    disabled={Boolean(updating)} onChange={() => toggle(user)}
                    aria-label={`Active status for ${user.username}`} />
                  {user.isActive ? ' Active' : ' Inactive'}
                </label></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {modalOpen && <AddAdminModal roles={roles} onClose={() => setModalOpen(false)} onCreated={async () => {
        try {
          await loadUsers()
        } catch {
          setError('Account created, but the staff list could not be refreshed.')
        }
      }} />}
    </section>
  )
}
