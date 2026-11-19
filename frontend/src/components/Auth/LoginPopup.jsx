import { useState, useContext, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, X } from 'lucide-react';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';
import './LoginPopup.css';

const LoginPopup = ({ setShowLogin, promptMessage = '', redirectAfterLogin = '' }) => {
  const { url, login, getSessionVersion } = useContext(StoreContext);
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
    const sessionVersion = getSessionVersion();

    let endpoint = url;
    if (mode === 'login') {
      endpoint += '/api/user/login';
    } else {
      endpoint += '/api/user/register';
    }

    try {
      const response = await axios.post(endpoint, data);

      if (response?.data?.success) {
        try {
          await login(response.data.token, response.data.user?.id, sessionVersion);
        } catch (error) {
          if (mode === 'signup') setMode('login');
          throw error;
        }
        setShowLogin(false); // Close modal on success
        if (redirectAfterLogin) {
          navigate(redirectAfterLogin);
        }
      } else {
        alert(response?.data?.message || 'Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Auth request failed', error);
      const message = error?.response?.data?.message || error?.message || 'An error occurred during authentication.';
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
          disabled={loading}
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
            key={mode}
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
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="popup-field">
      <label htmlFor={id} className="field-caption">{label}</label>
      <div className={`field-input-wrap${isPassword ? ' field-input-wrap-password' : ''}`}>
        <input
          id={id}
          type={isPassword && showPassword && value ? 'text' : type}
          name={name}
          value={value}
          onChange={event => {
            if (isPassword && !event.target.value) setShowPassword(false);
            onChange(event);
          }}
          required
          className="field-input"
        />
        {isPassword && value && (
          <button
            type="button"
            className="field-password-toggle"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-controls={id}
            onClick={() => setShowPassword(visible => !visible)}
          >
            {showPassword ? <Eye aria-hidden="true" size={20} /> : <EyeOff aria-hidden="true" size={20} />}
          </button>
        )}
      </div>
    </div>
  );
}

export default LoginPopup;