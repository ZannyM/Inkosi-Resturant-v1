import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'


const Footer = () => {
    return (
        <div className='footer' id='footer'>
            <div className="footer-content">
                <div className="footer-content-left">
                    <img src={assets.logo} alt="" />
                    <p>Lore ipsum dolor sit amet is an oreubhjsh fuauyji dhujd will lwt peopme move i  and be the peft tehy can be in the wornd</p>
                    <div className="footer-social-icons">
                        <img src={assets.facebook_icon} alt="" />
                        <img src={assets.twitter_icon} alt="" />
                        <img src={assets.linkedin_icon} alt="" />

                    </div>
                </div>
                <div className="footer-content-center">
                    <h2>COMPANY</h2>
                    <ul>
                        <li>Home</li>
                        <li>About Us</li>
                        <li>Delivery</li>
                        <li>Privacy Policy</li>
                    </ul>

                </div>
                <div className="footer-content-right">
                    <h2>GET IN TOUCH</h2>
                    <ul>
                        <li>123 Main Street</li>
                        <li>City, State 12345</li>
                        <li>Phone: (123) 456-7890</li>
                        <li>Email: info@company.com</li>
                    </ul>

                </div>
            </div>
            <hr />
            <p className="footer-copyright">© 2023 Tomato. All rights reserved.</p>
        </div>
    )
}

export default Footer
