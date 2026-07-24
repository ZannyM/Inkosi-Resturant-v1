import React, { useEffect, useMemo, useRef, useState } from 'react'
import "./Navbar.css"
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const Navbar = ({ url }) => {
  const navigate = useNavigate();
  const [isStoreLive, setIsStoreLive] = useState(true);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [managerName, setManagerName] = useState('Manager');
  const [searchValue, setSearchValue] = useState('');
  const [orderAlerts, setOrderAlerts] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);

  const fetchStoreStatus = async () => {
    try {
      const response = await axios.get(`${url}/api/store/status`);
      if (response.data.success) {
        setIsStoreLive(response.data.data.isStoreLive);
      }
    } catch (error) {
      toast.error('Could not fetch store status');
    }
  }

  const fetchLiveAlerts = async () => {
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (!response.data.success) {
        return;
      }

      const processingOrders = response.data.data
        .filter((order) => {
          const status = (order.status || '').toLowerCase();
          return status === 'food processing' || status === 'food proocessing';
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setNotificationCount(processingOrders.length);
      setOrderAlerts(processingOrders.slice(0, 6));
    } catch (error) {
      // no-op to avoid toast noise during polling
    }
  }

  useEffect(() => {
    const savedManagerName = localStorage.getItem('adminManagerName');
    if (savedManagerName) {
      setManagerName(savedManagerName);
    }

    fetchStoreStatus();
    fetchLiveAlerts();

    const intervalId = setInterval(() => {
      fetchLiveAlerts();
    }, 20000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }

      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  const handleStoreStatusToggle = async () => {
    const nextValue = !isStoreLive;
    try {
      const response = await axios.post(`${url}/api/store/status`, { isStoreLive: nextValue });
      if (response.data.success) {
        setIsStoreLive(nextValue);
        toast.success(nextValue ? 'Store is now accepting orders' : 'Store has been paused');
      } else {
        toast.error(response.data.message || 'Could not update store status');
      }
    } catch (error) {
      toast.error('Could not update store status');
    }
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const trimmedValue = searchValue.trim();
    if (!trimmedValue) {
      return;
    }

    navigate(`/orders?search=${encodeURIComponent(trimmedValue)}`);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminManagerName');
    toast.success('Logged out');
    setProfileOpen(false);
    navigate('/');
  }

  const managerLabel = useMemo(() => {
    const trimmed = managerName.trim();
    return trimmed || 'Manager';
  }, [managerName]);

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-left">
        <div className="admin-brand">Inkosi Admin Panel</div>
      </div>

      <div className="admin-navbar-right">
        <button
          type="button"
          className={isStoreLive ? 'store-status-pill live' : 'store-status-pill paused'}
          onClick={handleStoreStatusToggle}
        >
          <span className="status-dot" />
          {isStoreLive ? 'Store Live' : 'Kitchen Paused'}
        </button>

        <div className="notification-wrap" ref={notificationRef}>
          <button
            type="button"
            className="icon-pill"
            onClick={() => setNotificationOpen((prev) => !prev)}
            aria-label="Order alerts"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10.268 21a2 2 0 0 0 3.464 0" />
              <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8a6 6 0 1 0-12 0c0 4.499-1.411 5.956-2.738 7.326" />
            </svg>
            {notificationCount > 0 && <span className="notification-badge">{notificationCount}</span>}
          </button>
          {notificationOpen && (
            <div className="notification-panel">
              <p className="panel-title">Live Order Alerts</p>
              {orderAlerts.length === 0 && (
                <p className="panel-empty">No new processing orders.</p>
              )}
              {orderAlerts.map((order) => (
                <button
                  key={order._id}
                  type="button"
                  className="notification-item"
                  onClick={() => {
                    setNotificationOpen(false);
                    navigate('/orders');
                  }}
                >
                  <strong>#{String(order._id).slice(-6)}</strong>
                  <span>{order.address?.firstName || 'Guest'} {order.address?.lastName || ''}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <form className="admin-search" onSubmit={handleSearchSubmit}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search orders"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />
        </form>

        <button
          type="button"
          className="quick-add-btn"
          onClick={() => navigate('/add')}
        >
          + New Dish
        </button>

        <div className="profile-menu" ref={profileMenuRef}>
          <button
            type="button"
            className="manager-btn"
            onClick={() => setProfileOpen((prev) => !prev)}
          >
            <span className="manager-avatar" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <span>{managerLabel}</span>
            <span className="manager-caret">▾</span>
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <button type="button" onClick={() => { setProfileOpen(false); toast.info('Store settings page will be added next.'); }}>
                Store Settings
              </button>
              <button type="button" onClick={() => { setProfileOpen(false); toast.info('Staff management page will be added next.'); }}>
                Staff Management
              </button>
              <button type="button" onClick={() => { setProfileOpen(false); window.open('http://localhost:5174', '_blank', 'noopener,noreferrer'); }}>
                View Client Store
              </button>
              <button type="button" onClick={handleLogout}>Log Out</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
