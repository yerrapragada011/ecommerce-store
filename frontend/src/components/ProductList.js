import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './ProductList.css'

const ProductList = ({ addToBag, bagItems }) => {
  const [products, setProducts] = useState([])
  const [quantities, setQuantities] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [mainImage, setMainImage] = useState(null)
  const [outOfStockError, setOutOfStockError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          'http://localhost:8000/api/shopify/products'
        )
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        const data = await response.json()

        if (Array.isArray(data.products)) {
          const availableProducts = data.products.filter((product) => {
            const inventory =
              product.variants?.[0]?.node?.inventoryQuantity ?? 0
            return inventory > 0
          })
          setProducts(availableProducts)
        } else {
          throw new Error('No products found or incorrect data format')
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setError('Failed to load products. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    if (
      selectedProduct &&
      selectedProduct.images &&
      selectedProduct.images.length > 0
    ) {
      setMainImage(selectedProduct.images?.[0]?.node?.src)
    }
  }, [selectedProduct])

  const handleQuantityChange = (id, value) => {
    if (/^\d*$/.test(value)) {
      setQuantities((prev) => ({
        ...prev,
        [id]: value === '' ? '' : parseInt(value, 10),
      }))
    }
  }

  const handleAddToBag = (product) => {
    const availableQuantity =
      product.variants?.[0]?.node?.inventoryQuantity ?? 0
    const selectedQuantity = quantities[product.id] || 1
    if (selectedQuantity > availableQuantity) {
      setOutOfStockError(`Only ${availableQuantity} left in stock.`)
      return
    }
    if (!bagItems.some((item) => item.id === product.id)) {
      addToBag(product, selectedQuantity)
    }
    setSelectedProduct(null)
  }

  const getOptionValue = (product, optionName) => {
    const variant = product.variants?.[0]?.node
    return (
      variant?.selectedOptions?.find(
        (opt) => opt.name.toLowerCase() === optionName.toLowerCase()
      )?.value || 'N/A'
    )
  }

  const handleCloseErrorModal = () => setOutOfStockError(null)
  const handleCloseModal = () => setSelectedProduct(null)

  if (loading) return <p className="loading">Loading products...</p>
  if (error) return <p className="error">{error}</p>

  return (
    <div>
      <div className="product-list">
        {products.map((product) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => setSelectedProduct(product)}
          >
            <img
              src={product.images?.[0]?.node?.src || 'default-image-url'}
              alt={product.title}
            />

            <div className="product-details">
              <p className="product-title">{product.title}</p>
              <p className="product-price">
                ${product.variants?.[0]?.node?.price || 'N/A'}
              </p>
              <p className="product-size">
                Size: {getOptionValue(product, 'Size')}
              </p>
              <p className="product-color">
                Color: {getOptionValue(product, 'Color')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <div className="modal-container">
          <div className="modal-content">
            <span className="close-button" onClick={handleCloseModal}>
              &times;
            </span>
            <div className="image-gallery">
              {mainImage && (
                <img
                  src={
                    selectedProduct.images?.[0]?.node?.src ||
                    'default-image-url'
                  }
                  alt={selectedProduct?.title}
                  className="modal-image"
                />
              )}
              {selectedProduct?.images?.length > 0 && (
                <div className="thumbnail-container">
                  {selectedProduct.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.node?.src || 'default-image-url'}
                      alt={`${selectedProduct.title} ${index + 1}`}
                      className={`thumbnail ${
                        image.node?.src === mainImage ? 'active' : ''
                      }`}
                      onClick={() => setMainImage(image.node?.src)}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="modal-details">
              <h3 className="product-title">{selectedProduct.title}</h3>
              <h3 className="product-price">
                ${selectedProduct.variants?.[0]?.node?.price}
              </h3>
              <p className="product-size">
                Size: {getOptionValue(selectedProduct, 'Size')}
              </p>
              <p className="product-color">
                Color: {getOptionValue(selectedProduct, 'Color')}
              </p>
              {bagItems.some((item) => item.id === selectedProduct.id) ? (
                <Link to="/bag" className="view-item-in-bag">
                  View Item in Bag
                </Link>
              ) : (
                <div className="quantity-container">
                  <input
                    type="text"
                    placeholder="Quantity"
                    value={quantities[selectedProduct.id] ?? 1}
                    onChange={(e) =>
                      handleQuantityChange(selectedProduct.id, e.target.value)
                    }
                    className="quantity-input"
                  />
                  <button
                    className="add-to-bag"
                    onClick={() => handleAddToBag(selectedProduct)}
                  >
                    Add to Bag
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {outOfStockError && (
        <div className="modal-container">
          <div className="modal-content">
            <span className="close-button" onClick={handleCloseErrorModal}>
              &times;
            </span>
            <p className="error-message">{outOfStockError}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductList
