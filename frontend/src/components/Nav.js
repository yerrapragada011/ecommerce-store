import React from 'react'
import { Link } from 'react-router-dom'
import './Nav.css'

const Nav = ({ bagItemCount }) => {
  return (
    <nav className="nav">
      <Link to="/" className="logo">
        Gus Shop
      </Link>
      <Link to="/bag" className="bag-button">
        Bag ({bagItemCount})
      </Link>
    </nav>
  )
}

export default Nav
