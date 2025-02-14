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
        <FaShoppingBag className="bag-icon" />
        <span className="bag-text">Bag</span>({bagItemCount})
      </Link>
    </nav>
  )
}

export default Nav
