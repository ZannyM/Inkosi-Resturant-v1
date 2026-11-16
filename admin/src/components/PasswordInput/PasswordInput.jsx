import { useState } from 'react'
import './PasswordInput.css'

export default function PasswordInput({ id, label = 'password', value, onChange, ...props }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="password-input">
      <input {...props} id={id} value={value} type={visible && value ? 'text' : 'password'}
        onChange={event => {
          if (!event.target.value) setVisible(false)
          onChange(event)
        }} />
      {value && <button
        type="button"
        className="password-toggle"
        aria-label={`${visible ? 'Hide' : 'Show'} ${label}`}
        aria-controls={id}
        onClick={() => setVisible(previous => !previous)}
      >
        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
          {!visible && <path d="M3 3l18 18" />}
        </svg>
      </button>}
    </div>
  )
}
