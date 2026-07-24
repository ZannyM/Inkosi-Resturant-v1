import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import './LoginPopup.css';

const LoginPopup = ({ setShowLogin, promptMessage = '', redirectAfterLogin = '' }) => {
  const { url, setToken } = useContext(StoreContext);
  const navigate = useNavigate();

  // 'login' or 'signup'
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);

  // Form input state keeping all backend required fields
  const [data, setData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // API Call to Express/MongoDB backend
  const onAuthSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    let endpoint = url;
    if (mode === 'login') {
      endpoint += '/api/user/login';
    } else {
      endpoint += '/api/user/register';
    }

    try {
      const response = await axios.post(endpoint, data);

      if (response?.data?.success) {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setShowLogin(false); // Close modal on success
        if (redirectAfterLogin) {
          navigate(redirectAfterLogin);
        }
      } else {
        alert(response?.data?.message || 'Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Auth request failed', error);
      const message = error?.response?.data?.message || 'An error occurred during authentication.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-popup-overlay">
      <div className="login-popup-card">
        {/* Close Modal Button */}
        <button
          type="button"
          onClick={() => setShowLogin(false)}
          className="login-popup-close-btn"
          aria-label="Close"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>

        <p className="eyebrow text-center">Inkosi</p>
        <h1 className="login-popup-title">
          {mode === 'login' ? 'Welcome back.' : 'Reserve a seat.'}
        </h1>
        <p className="login-popup-subtitle">
          {mode === 'login'
            ? 'Sign in to see your orders.'
            : 'Create an account in a moment.'}
        </p>

        {promptMessage && (
          <div className="login-popup-prompt">
            {promptMessage}
          </div>
        )}

        <form onSubmit={onAuthSubmit} className="login-popup-form">
          {mode === 'signup' && (
            <Field
              label="Full name"
              name="name"
              value={data.name}
              onChange={onChangeHandler}
            />
          )}

          <Field
            label="Email"
            type="email"
            name="email"
            value={data.email}
            onChange={onChangeHandler}
          />

          <Field
            label="Password"
            type="password"
            name="password"
            value={data.password}
            onChange={onChangeHandler}
          />

          <button type="submit" disabled={loading} className="btn-popup-submit">
            {loading
              ? 'Processing…'
              : mode === 'login'
              ? 'Sign in'
              : 'Create account'}
          </button>
        </form>

        <div className="login-popup-divider">
          <div className="divider-line" />
          <span className="divider-text">or</span>
          <div className="divider-line" />
        </div>

        <button
          type="button"
          onClick={() => alert('Google authentication is coming soon!')}
          className="btn-popup-google"
        >
          Continue with Google
        </button>

        <p className="login-popup-switch-prompt">
          {mode === 'login' ? 'New to Inkosi?' : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setData({ name: '', email: '', password: '' });
            }}
            className="login-popup-switch-btn"
          >
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

// Reusable Field Component
function Field({ label, name, value, onChange, type = 'text' }) {
  return (
    <label className="popup-field">
      <span className="field-caption">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="field-input"
      />
    </label>
  );
}

export default LoginPopup;