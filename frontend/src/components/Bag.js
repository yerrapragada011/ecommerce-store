import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import './Bag.css'

const Bag = ({ items, updateQuantity, removeFromBag }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedItemIndex, setSelectedItemIndex] = useState(null)

  const totalPrice = items.reduce((sum, item) => {
    const price = item.variants.edges[0]?.node.price
      ? parseFloat(item.variants.edges[0]?.node.price)
      : 0
    return sum + price * item.quantity
  }, 0)

  const proceedToCheckout = async () => {
    try {
      const lineItems = items.map((item) => ({
        variant_id: item.variants.edges[0]?.node.id,
        quantity: item.quantity,
      }))

      const response = await fetch(
        'http://localhost:8000/api/shopify/checkout',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lineItems }),
        }
      )

      if (response.ok) {
        const data = await response.json()
        window.location.href = data.checkoutUrl
      } else {
        console.error('Failed to create checkout session')
        alert('Failed to proceed to checkout. Please try again.')
      }
    } catch (error) {
      console.error('Error during checkout:', error)
      alert('An error occurred. Please try again later.')
    }
  }

  const handleRemoveClick = (index) => {
    setSelectedItemIndex(index)
    setModalOpen(true)
  }

  const confirmRemoval = () => {
    removeFromBag(selectedItemIndex)
    setModalOpen(false)
  }

  const cancelRemoval = () => {
    setModalOpen(false)
    setSelectedItemIndex(null)
  }

  return (
    <div className="bag-container">
      <div>
        {items.length === 0 ? (
          <div className="empty-bag-container">
            <div className="back-link">
              <Link to="/">
                <button className="empty-back-button">←</button>
              </Link>
            </div>
            <p className="empty-bag">Your bag is empty.</p>
          </div>
        ) : (
          <div className="bag-items-container">
            <div className="back-link">
              <Link to="/">
                <button className="back-button">←</button>
              </Link>
            </div>
            {items.map((item, index) => (
              <div key={index} className="bag-item">
                <img src={item.images?.edges[0]?.node?.src} alt={item.title} />
                <div className="bag-item-info">
                  <div>
                    <h3>{item.title}</h3>
                    <p>Price: ${item.variants.edges[0]?.node.price || 'N/A'}</p>
                    <p>
                      Quantity:{' '}
                      <span key={item.quantity} className="value-update">
                        {item.quantity}
                      </span>
                    </p>
                  </div>
                  <div className="quantity-buttons">
                    <button
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      disabled={item.quantity === 1}
                    >
                      -
                    </button>
                    <button
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                      disabled={item.quantity === 10}
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemoveClick(index)}
                      className="remove-button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="checkout-container">
              <p className="total-price">
                Total:{' '}
                <span key={totalPrice} className="value-update">
                  ${totalPrice.toFixed(2)}
                </span>
              </p>

              <div className="checkout-button-container">
                <button onClick={proceedToCheckout} className="checkout-button">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Are you sure you want to remove this product from your bag?</p>
            <div className="modal-buttons">
              <button className="yes-button" onClick={confirmRemoval}>
                Yes
              </button>
              <button onClick={cancelRemoval}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bag
