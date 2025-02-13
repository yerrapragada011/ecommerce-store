import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Bag.css'

const Bag = ({ items, updateQuantity, removeFromBag }) => {
  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [selectedItemIndex, setSelectedItemIndex] = useState(null)
  const [stockErrorMessage, setStockErrorMessage] = useState('')
  const navigate = useNavigate()

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
    setRemoveModalOpen(true)
  }

  const confirmRemoval = () => {
    removeFromBag(selectedItemIndex)
    setRemoveModalOpen(false)

    if (items.length === 1) {
      navigate('/')
    }
  }

  const cancelRemoval = () => {
    setRemoveModalOpen(false)
    setSelectedItemIndex(null)
  }

  const handleQuantityIncrease = (index, item) => {
    const availableStock = item.variants.edges[0]?.node?.inventoryQuantity || 10

    if (item.quantity + 1 > availableStock) {
      setStockErrorMessage(`Only ${availableStock} left in stock.`)
      setStockModalOpen(true)
    } else {
      updateQuantity(index, item.quantity + 1)
    }
  }

  return (
    <div className="bag-container">
      {items.length === 0 ? (
        <p className="empty-bag-message">No items in bag</p>
      ) : (
        <div className="bag-items-container">
          <div className="bag-items">
            {items.map((item, index) => (
              <div key={index} className="bag-item">
                <img src={item.images?.edges[0]?.node?.src} alt={item.title} />
                <div className="bag-item-info">
                  <div className="bag-item-details">
                    <h3>{item.title}</h3>
                    <p className="price">
                      Price: ${item.variants.edges[0]?.node.price || 'N/A'}
                    </p>
                    <p>
                      Quantity:{' '}
                      <span key={item.quantity} className="value-update">
                        {item.quantity}
                      </span>
                    </p>
                  </div>
                  <div className="quantity-buttons">
                    <button
                      className="quantity-button"
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                      disabled={item.quantity === 1}
                    >
                      -
                    </button>
                    <button
                      className="quantity-button"
                      onClick={() => handleQuantityIncrease(index, item)}
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
          </div>
          <div className="checkout-container">
            <div className="total-price">
              <p>Total: </p>
              <span key={totalPrice} className="value-update">
                <p className="price">${totalPrice.toFixed(2)}</p>
              </span>
            </div>
            <div className="checkout-button-container">
              <button onClick={proceedToCheckout} className="checkout-button">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {removeModalOpen && (
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

      {stockModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <p>{stockErrorMessage}</p>
            <div className="modal-buttons">
              <button onClick={() => setStockModalOpen(false)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Bag
