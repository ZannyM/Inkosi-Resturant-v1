import React, { useState } from 'react'
import Navbar from './components/Navbar/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home/Home'
import Cart from './pages/Cart/Cart'
import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import Verify from './pages/Verify/Verify'
import MyOrders from './pages/MyOrders/MyOrders'
import CartDrawer from './components/CartDrawer/CartDrawer'

const App = () => {
  const [showLogin, setShowLogin] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Replace this with your real cart state/context
  const [cartItems, setCartItems] = useState([]) // [{ dish, quantity }]

  const setQty = (dishId, qty) => {
    setCartItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.dish.id !== dishId)
      return prev.map((i) => (i.dish.id === dishId ? { ...i, quantity: qty } : i))
    })
  }

  const subtotal = cartItems.reduce((sum, i) => sum + i.dish.price * i.quantity, 0)
  const deliveryFee = cartItems.length > 0 ? 2.99 : 0
  const total = subtotal + deliveryFee
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <>
      {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : null}

      <div className='app-container'>
        <Navbar
          setShowLogin={setShowLogin}
          count={cartCount}
          setDrawerOpen={setDrawerOpen}
        />

        <div className='app'>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<PlaceOrder />} />
            <Route path='/verify' element={<Verify/>}/>
            <Route path='/myorders' element={<MyOrders/>}/>
          </Routes>
        </div>

        <Footer />
      </div>

      <CartDrawer
        items={cartItems}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        setQty={setQty}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        total={total}
      />
    </>
  )
}

export default App



// import React, { useState } from 'react'
// import Navbar from './components/Navbar/Navbar'
// import { Routes, Route } from 'react-router-dom'
// import Home from './pages/Home/Home'
// import Cart from './pages/Cart/Cart'
// import PlaceOrder from './pages/PlaceOrder/PlaceOrder'
// import Footer from './components/Footer/Footer'
// import LoginPopup from './components/LoginPopup/LoginPopup'
// import Verify from './pages/Verify/Verify'
// import MyOrders from './pages/MyOrders/MyOrders'

// const App = () => {
//   const [showLogin, setShowLogin] = useState(false)

//   return (
//     <>
//       {showLogin ? <LoginPopup setShowLogin={setShowLogin} /> : null}
      
//       {/* Outer flex wrapper taking up at least 100vh height */}
//       <div className='app-container'>
//         <Navbar setShowLogin={setShowLogin} />

//         {/* Main route content constrained to 80% width and growing to fill vertical space */}
//         <div className='app'>
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/cart" element={<Cart />} />
//             <Route path="/order" element={<PlaceOrder />} />
//             <Route path='/verify' element={<Verify/>}/>
//             <Route path='/myorders' element={<MyOrders/>}/>
//           </Routes>
//         </div>

//         <Footer />
//       </div>
//     </>
//   )
// }

// export default App