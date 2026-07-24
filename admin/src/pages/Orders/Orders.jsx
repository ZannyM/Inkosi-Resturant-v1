import React from 'react'
import "./Orders.css"
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useEffect } from 'react'
import axios from 'axios'
import { assets } from '../../assets/assets'
import { useLocation } from 'react-router-dom'

const ORDER_STATUS_FILTERS = [
  { label: "All", value: "all" },
  { label: "Processing", value: "Food Processing" },
  { label: "Out for delivery", value: "Out for delivery" },
  { label: "Delivered", value: "Delivered" }
]


const Orders = ({ url }) => {
  //state variable that stores data coming from the api
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const location = useLocation();

  const searchQuery = new URLSearchParams(location.search).get("search")?.trim().toLowerCase() || "";

  const fetchAllOrders = async (statusFilter = selectedStatus) => {
    try {
      const response = await axios.get(url + "/api/order/list", {
        params: {
          status: statusFilter
        }
      });
      if (response.data.success) {
        setOrders(response.data.data);
      } else {
        toast.error("Error fetching orders")
      }
    } catch (error) {
      toast.error("Error fetching orders")
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(url + "/api/order/status", {
        orderId,
        status: event.target.value
      })
      if(response.data.success){
          await fetchAllOrders(selectedStatus);
      }else{
        toast.error("Error updating order status")
      }
    } catch (error) {
      toast.error("Error updating order status")
    }
  }

  const visibleOrders = orders.filter((order) => {
    if (!searchQuery) {
      return true;
    }

    const customerName = `${order.address?.firstName || ""} ${order.address?.lastName || ""}`.toLowerCase();
    const phone = String(order.address?.phone || "").toLowerCase();
    const orderId = String(order._id || "").toLowerCase();
    const paystackReference = String(order.paystackReference || "").toLowerCase();
    const itemNames = Array.isArray(order.items)
      ? order.items.map((item) => item.name).join(" ").toLowerCase()
      : "";

    return (
      orderId.includes(searchQuery) ||
      paystackReference.includes(searchQuery) ||
      customerName.includes(searchQuery) ||
      phone.includes(searchQuery) ||
      itemNames.includes(searchQuery)
    );
  });

  useEffect(() => {
    fetchAllOrders(selectedStatus);
  }, [selectedStatus])

  return (
    <div className='order add'>
      <h3>Order Page</h3>
      <div className="order-filter-bar">
        <p>Filter by status</p>
        <div className="order-filter-options">
          {ORDER_STATUS_FILTERS.map((statusOption) => (
            <button
              key={statusOption.value}
              type="button"
              className={selectedStatus === statusOption.value ? "order-filter-chip active" : "order-filter-chip"}
              onClick={() => setSelectedStatus(statusOption.value)}
            >
              {statusOption.label}
            </button>
          ))}
        </div>
      </div>
      {searchQuery && (
        <p className="order-search-indicator">Showing search results for: {searchQuery}</p>
      )}
      <div className="order-list">
        {visibleOrders.length === 0 && (
          <p className="order-empty">No orders found for this filter.</p>
        )}
        {visibleOrders.map((order, index) => (
          <div key={index} className="order-item">
            <img src={assets.parcel_icon} alt="" />
            <div>
              <p className="order-item-reference">Ref: {order.paystackReference || "N/A"}</p>
              <p className='order-item-food'>
                {order.items.map((item, index) => {
                  if (index === order.items.length - 1) {
                    return item.name + " X " + item.quantity
                  } else {
                    return item.name + " X " + item.quantity + ","
                  }

                })}</p>
              <p className="order-item-name">
                {order.address.firstName + " " + order.address.lastName}
              </p>
              <div className="order-item-address">
                <p>{order.address.street + ", "}</p>
                <p>{order.address.city + ", " + order.address.province + ", " + order.address.country + ", " + order.address.zipcode}</p>
              </div>
              <p className="order-item-phone">{order.address.phone}</p>
            </div>
            <p>Items : {order.items.length}</p>
            <p>R{order.amount}</p>
            <select onChange={(event) => statusHandler(event, order._id)} value={order.status}>
              <option value="Food Processing">Food Processing</option>
              <option value="Food Proocessing">Food Processing (Legacy)</option>
              <option value="Out for delivery">Out for delivery</option>
              <option value="Delivered">Delivered</option>

            </select>

          </div>
        ))}
      </div>

    </div>
  )
}

export default Orders
