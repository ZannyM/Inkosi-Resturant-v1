import React from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'

const Navbar = () => {
  return (
    <div className='navbar'>
        <img src={assets.logo} alt="" className="logo" />
        <ul className="navbar-menu">
            <li className="">home</li>
            <li className="">menu</li>
            <li className="">mobile-app</li>
            <li className="">contact us</li>
        </ul>
        <div className="navbar-right">
            <img src={assets.search_icon} alt=""/>
            <div className="navbar-search-icon">
                <img src={assets.basket_icon} alt="" />
                <div className="dot"></div>
            </div>
            <button className="button">sign in</button>
        </div>
      
    </div>
  )
}

export default Navbar
