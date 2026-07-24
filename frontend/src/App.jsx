import React, { useState, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
// import LoginPopup from './components/LoginPopup/LoginPopup';
import CartDrawer from './components/CartDrawer/CartDrawer';

import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
// import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Verify from './pages/Verify/Verify';
import MyOrders from './pages/MyOrders/MyOrders';
import Menu from './pages/Menu/Menu';
import CheckOut from './pages/CheckOut/CheckOut';

import { StoreContext } from './context/StoreContext';

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Cart context state fallback
  const { cartItems = {}, food_list = [] } = useContext(StoreContext) || {};

  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}

      <div className="app-container">
        <Navbar
          setShowLogin={setShowLogin}
          setDrawerOpen={setDrawerOpen}
        />

        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<CheckOut />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/myorders" element={<MyOrders />} />
          </Routes>
        </div>

        <Footer />
      </div>

      <CartDrawer
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
    </>
  );
};

export default App;