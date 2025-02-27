import React, { useState, useEffect } from 'react'
import axios from 'axios'

const Account = () => {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [addresses, setAddresses] = useState([])

  useEffect(() => {
    const fetchAccountDetails = async () => {
      try {
        const response = await axios.get(
          'http://localhost:8000/api/shopify/account',
          {
            withCredentials: true,
          }
        )
        setUser(response.data.user)
        setOrders(response.data.orders)
        setAddresses(response.data.addresses)
      } catch (error) {
        console.error('Error fetching account details:', error)
      }
    }

    fetchAccountDetails()
  }, [])

  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost:8000/api/shopify/logout',
        {},
        { withCredentials: true }
      )
      window.location.href = '/'
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <div className="account-container">
      <h2>My Account</h2>
      {user ? (
        <div>
          <div>
            <h3>Personal Details</h3>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Phone:</strong> {user.phone || 'Not provided'}
            </p>

            <h3>Order History</h3>
            {orders.length > 0 ? (
              <ul>
                {orders.map((order) => (
                  <li key={order.id}>
                    Order #{order.id} - {order.totalPrice} - {order.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No orders found.</p>
            )}

            <h3>Address Book</h3>
            {addresses.length > 0 ? (
              <ul>
                {addresses.map((address) => (
                  <li key={address.id}>
                    {address.address1}, {address.city}, {address.zip},{' '}
                    {address.country}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No saved addresses.</p>
            )}
          </div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Loading account details...</p>
      )}
    </div>
  )
}

export default Account
