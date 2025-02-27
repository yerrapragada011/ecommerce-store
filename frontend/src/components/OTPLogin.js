import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import './OTPLogin.css'

const OTPLogin = () => {
  const [email, setEmail] = useState('')
  const [otpRequested, setOtpRequested] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpToken, setOtpToken] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        'http://localhost:8000/api/shopify/request-otp',
        { email },
        { withCredentials: true }
      )
      setMessage(response.data.message)
      // Save the otpToken returned from the backend
      setOtpToken(response.data.otpToken)
      setOtpRequested(true)
    } catch (error) {
      console.error(
        'Error requesting OTP:',
        error.response?.data || error.message
      )
      setMessage('Error requesting OTP.')
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post(
        'http://localhost:8000/api/shopify/verify-otp',
        { email, otp, otpToken },
        { withCredentials: true }
      )
      setMessage(response.data.message)
      // On successful login, redirect to account page.
      navigate('/account')
    } catch (error) {
      console.error(
        'Error verifying OTP:',
        error.response?.data || error.message
      )
      setMessage('Error verifying OTP.')
    }
  }

  return (
    <div className="otp-login-container">
      <div className="otp-login-form">
        {!otpRequested ? (
          <div className="otp-heading">
            <h2>Passwordless Login / Sign Up</h2>
            <p>Enter your email and we'll send you a login code</p>
            <form onSubmit={handleEmailSubmit}>
              <div className="email-input-container">
                <input
                  className="email-input"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button className="request-button" type="submit">
                  Request OTP
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="otp-input-form">
            <form onSubmit={handleOtpSubmit}>
              <div className="otp-input-container">
                <p>An OTP has been sent to {email}</p>
                <div>
                  <input
                    className="otp-input"
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
                <button className="otp-button" type="submit">
                  Verify OTP
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
      {message && <p>{message}</p>}
    </div>
  )
}

export default OTPLogin
