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
        const availableProducts = data.products.filter((product) => {
          const inventory =
            product.variants.edges[0]?.node?.inventoryQuantity ?? 0
          return inventory > 0
        })
        setProducts(availableProducts)
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
    if (selectedProduct && selectedProduct.images.edges.length > 0) {
      setMainImage(selectedProduct.images.edges[0]?.node.src)
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
      product.variants.edges[0]?.node?.inventoryQuantity ?? 0
    const selectedQuantity = quantities[product.id] || 1
    if (selectedQuantity > availableQuantity) {
      setOutOfStockError(`Only ${availableQuantity} left in stock.`)
      return
    }
    if (!bagItems.some((item) => item.id === product.id)) {
      addToBag(product, quantities[product.id] || 1)
    }
    setSelectedProduct(null)
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
              src={product.images?.edges[0]?.node?.src}
              alt={product.title}
            />
            <div className="product-details">
              <p className="product-title">{product.title}</p>
              <p className="product-price">
                ${product.variants.edges[0]?.node.price}
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
                  src={mainImage}
                  alt={selectedProduct?.title}
                  className="modal-image"
                />
              )}
              <div className="thumbnail-container">
                {selectedProduct?.images?.edges.map((image, index) => (
                  <img
                    key={index}
                    src={image.node.src}
                    alt={`${selectedProduct.title} ${index + 1}`}
                    className={`thumbnail ${
                      image.node.src === mainImage ? 'active' : ''
                    }`}
                    onClick={() => setMainImage(image.node.src)}
                  />
                ))}
              </div>
            </div>
            <div className="modal-details">
              <div className='modal-info'>
                <h3 className="product-title">{selectedProduct.title}</h3>
                <h3 className="product-price">
                  ${selectedProduct.variants.edges[0]?.node.price}
                </h3>
              </div>
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
