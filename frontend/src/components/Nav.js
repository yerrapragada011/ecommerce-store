import React from 'react'
import { Link } from 'react-router-dom'
import { FaShoppingBag } from 'react-icons/fa'
import './Nav.css'

const Nav = ({ bagItemCount }) => {
  return (
    <nav className="nav">
      <Link to="/" className="logo">
        Gus Shop
      </Link>
      <Link to="/bag" className="bag-button">
        <span className="bag-text">Bag</span>
        <FaShoppingBag className="bag-icon" /> ({bagItemCount})
      </Link>
    </nav>
  )
}

export default Nav
