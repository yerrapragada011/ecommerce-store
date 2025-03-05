import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <ul className="footer-links">
          <li>
            <Link to="/terms-conditions">Terms & Conditions</Link>
          </li>
          <li>
            <Link to="/refund-return-policy">Refund & Return Policy</Link>
          </li>
          <li>
            <Link to="/shopping-policy">Shipping Policy</Link>
          </li>
        </ul>
      </div>
    </footer>
  )
}

export default Footer
