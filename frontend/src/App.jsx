import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import CartDrawer from './components/CartDrawer/CartDrawer';
import LoginPopup from './components/Auth/LoginPopup';

import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
// import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Verify from './pages/Verify/Verify';
import MyOrders from './pages/MyOrders/MyOrders';
import Menu from './pages/Menu/Menu';
import CheckOut from './pages/CheckOut/CheckOut';
import Confirmation from './pages/Confirmation/Confirmation';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [loginPromptMessage, setLoginPromptMessage] = useState('');
  const [redirectAfterLogin, setRedirectAfterLogin] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const openLoginPrompt = (promptMessage = '', redirectPath = '') => {
    setLoginPromptMessage(promptMessage);
    setRedirectAfterLogin(redirectPath);
    setShowLogin(true);
  };

  const handleSetShowLogin = (shouldShow) => {
    if (shouldShow) {
      openLoginPrompt();
      return;
    }

    setShowLogin(false);
    setLoginPromptMessage('');
    setRedirectAfterLogin('');
  };

  useEffect(() => {
    if (!location.state?.openLogin) return;

    openLoginPrompt(
      location.state.promptMessage || '',
      location.state.redirectAfterLogin || ''
    );

    // Clear route state after consuming the login intent.
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate]);

  return (
    <>
      {showLogin && (
        <LoginPopup
          setShowLogin={handleSetShowLogin}
          promptMessage={loginPromptMessage}
          redirectAfterLogin={redirectAfterLogin}
        />
      )}
     
      <div className="app-container">
        <Navbar
          setShowLogin={handleSetShowLogin}
          setDrawerOpen={setDrawerOpen}
        />

        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<CheckOut />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/myorders" element={<MyOrders />} />
          </Routes>
        </div>

        <Footer />
      </div>

      <CartDrawer
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        openLoginPrompt={openLoginPrompt}
      />
    </>
  );
};

export default App;