import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Bag.css'

const Bag = ({ items, updateQuantity, removeFromBag }) => {
  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [mainImages, setMainImages] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    const initialImages = {}
    items.forEach((item) => {
      const firstImage = item.images?.[0]?.node?.src
      if (firstImage) {
        initialImages[item.variants?.[0]?.node.id] = firstImage
      }
    })
    setMainImages(initialImages)
  }, [items])

  const totalPrice = items.reduce((sum, item) => {
    const price = item.variants?.[0]?.node.price
      ? parseFloat(item.variants?.[0]?.node.price)
      : 0
    return sum + price * item.quantity
  }, 0)

  const proceedToCheckout = async () => {
    try {
      const lineItems = items.map((item) => ({
        variant_id: item.variants?.[0]?.node.id,
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

  const handleQuantityIncrease = (item) => {
    updateQuantity(item.variantId, item.size, item.quantity + 1)
  }

  const handleQuantityDecrease = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.variantId, item.size, item.quantity - 1)
    }
  }

  const handleRemoveClick = (item) => {
    setSelectedVariantId(item.variantId)
    setSelectedSize(item.size)
    setRemoveModalOpen(true)
  }

  const confirmRemoval = () => {
    removeFromBag(selectedVariantId, selectedSize)
    setRemoveModalOpen(false)

    if (items.length === 1) {
      navigate('/')
    }
  }

  const cancelRemoval = () => {
    setRemoveModalOpen(false)
    setSelectedVariantId(null)
    setSelectedSize(null)
  }

  const handleThumbnailClick = (imageSrc, index) => {
    setMainImages((prev) => ({
      ...prev,
      [index]: imageSrc,
    }))
  }

  const getOptionValue = (item, optionName) => {
    const variant = item.variants?.[0]?.node
    return (
      variant?.selectedOptions?.find(
        (opt) => opt.name.toLowerCase() === optionName.toLowerCase()
      )?.value || 'N/A'
    )
  }

  return (
    <div className="bag-container">
      {items.length === 0 ? (
        <p className="empty-bag-message">No items in bag</p>
      ) : (
        <div className="bag-items-container">
          <div className="bag-items">
            {items.map((item) => {
              const variant = item.variants?.[0]
              const variantId = variant.node.id
              const productImages = item.images || []
              const mainProductImage =
                mainImages[variantId] || productImages[0]?.node?.src

              return (
                <div key={variantId} className="bag-item">
                  <div className="bag-item-image">
                    <img
                      src={mainProductImage}
                      alt={item.title}
                      className="bag-main-image"
                    />
                    <div className="thumbnail-container">
                      {productImages.map((image, idx) => (
                        <img
                          key={idx}
                          src={image.node.src}
                          alt={`Thumbnail ${idx + 1}`}
                          className={`thumbnail ${
                            image.node.src === mainImages[variantId]
                              ? 'active'
                              : ''
                          }`}
                          onClick={() =>
                            handleThumbnailClick(image.node.src, variantId)
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <div className="bag-item-info">
                    <div className="bag-item-details">
                      <h3>{item.title}</h3>
                      <p className="price">
                        Price: ${item.variants?.[0]?.node.price || 'N/A'}
                      </p>
                      <p>
                        Quantity:{' '}
                        <span className="value-update">{item.quantity}</span>
                      </p>
                      <p>Size: {item.size || getOptionValue(item, 'Size')}</p>

                      <p className="product-color">
                        Color: {getOptionValue(item, 'Color')}
                      </p>
                    </div>
                    <div className="quantity-buttons">
                      <button
                        className="quantity-button"
                        onClick={() => handleQuantityDecrease(item)}
                        disabled={item.quantity === 1}
                      >
                        -
                      </button>

                      <button
                        className="quantity-button"
                        onClick={() => handleQuantityIncrease(item)}
                        disabled={
                          item.quantity >=
                          (item.variants?.find((variant) =>
                            variant.node.selectedOptions.some(
                              (option) =>
                                option.name === 'Size' &&
                                option.value === item.size
                            )
                          )?.node?.inventoryQuantity || 10)
                        }
                      >
                        +
                      </button>

                      <button
                        onClick={() => handleRemoveClick(item)}
                        className="remove-button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="checkout-note">
            <p className="star">* </p>
            <span>
              Please note that the final price does not include shipping and
              handling fees.
            </span>
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
    </div>
  )
}

export default Bag
