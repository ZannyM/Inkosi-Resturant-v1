import "./Sidebar.css"
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'
import useAuth from '../../auth/useAuth'
//always remember to import the assets from the assets.js file in the Sidebar component. This will allow you to use the images in the sidebar options.

const Sidebar = () => {
    const { session } = useAuth()
    return (
        <div className="sidebar">
            <div className="sidebar-options">
                {session.permissions.includes('catalog:write') && <>
                <NavLink to='/featured' className="sidebar-option">
                    <img src={assets.add_icon} alt="" />
                    <p>Featured</p>
                </NavLink>
                <NavLink to='/add' className="sidebar-option">
                    <img src={assets.add_icon} alt="" />
                    <p>Add Items</p>
                </NavLink>
                <NavLink to='/list' className="sidebar-option">
                    <img src={assets.order_icon} alt=""/>
                    <p>List Items</p>
                </NavLink>
                </>}
                <NavLink to='/orders' className="sidebar-option">
                    <img src={assets.order_icon} alt=""/>
                    <p>Orders</p>
                </NavLink>
                {session.permissions.includes('staff:manage') && <NavLink to='/staff' className="sidebar-option">
                    <img src={assets.order_icon} alt="" />
                    <p>Staff &amp; Roles</p>
                </NavLink>}
            </div>

        </div>
    )
}

export default Sidebar
