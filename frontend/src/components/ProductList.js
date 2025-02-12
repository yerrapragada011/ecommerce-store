import React, { useState, useEffect } from 'react'
import './ProductList.css'

const ProductList = ({ addToBag, bagItems }) => {
  const [products, setProducts] = useState([])
  const [quantities, setQuantities] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

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
        setProducts(data.products)
      } catch (error) {
        console.error('Error fetching products:', error)
        setError('Failed to load products. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleQuantityChange = (id, value) => {
    if (/^\d*$/.test(value)) {
      setQuantities((prev) => ({
        ...prev,
        [id]: value === '' ? '' : parseInt(value, 10),
      }))
    }
  }

  const handleAddToBag = (product) => {
    if (!bagItems.some((item) => item.id === product.id)) {
      addToBag(product, quantities[product.id] || 1)
    }
    setSelectedProduct(null) // Close the modal after adding to the bag
  }

  const handleViewItem = (product) => {
    setSelectedProduct(product)
  }

  const handleCloseModal = () => {
    setSelectedProduct(null)
  }

  if (loading) {
    return <p className="loading">Loading products...</p>
  }

  if (error) {
    return <p className="error">{error}</p>
  }

  return (
    <div>
      <div className="product-list">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={product.images?.edges[0]?.node?.src}
              alt={product.title}
            />
            <div className="product-info">
              <p className="product-title">{product.title}</p>
              <div className="product-details">
                <p className="product-price">
                  ${product.variants.edges[0]?.node.price}
                </p>
                <div className="product-actions">
                  <button
                    className="view-item-button"
                    onClick={() => handleViewItem(product)}
                  >
                    View Item
                  </button>
                </div>
              </div>
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
            <img
              src={selectedProduct.images?.edges[0]?.node?.src}
              alt={selectedProduct.title}
              className="modal-image"
            />
            <div className="modal-details">
              <h3>{selectedProduct.title}</h3>
              <p className="product-price">
                ${selectedProduct.variants.edges[0]?.node.price}
              </p>
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductList
