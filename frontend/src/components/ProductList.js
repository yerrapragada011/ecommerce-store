import React, { useState, useEffect } from 'react'
import './ProductList.css'

const ProductList = ({ addToBag, bagItems }) => {
  const [products, setProducts] = useState([])
  const [quantities, setQuantities] = useState({})
  const [selectedSize, setSelectedSize] = useState({})
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

  const handleSizeChange = (id, size) => {
    setSelectedSize((prev) => ({
      ...prev,
      [id]: size,
    }))
  }

  const handleAddToBag = (product) => {
    const selectedQuantity = quantities[product.id] || 1
    const selectedProductSize = selectedSize[product.id]

    if (!selectedProductSize || selectedProductSize === '-') {
      setOutOfStockError('Please select a size.')
      return
    }

    const selectedVariant = product.variants?.find((variant) =>
      variant.node.selectedOptions.some(
        (option) =>
          option.name.toLowerCase() === 'size' &&
          option.value.toLowerCase() === selectedProductSize.toLowerCase()
      )
    )

    if (!selectedVariant) {
      setOutOfStockError(
        `Size ${selectedProductSize} is not available for this product.`
      )
      return
    }

    const selectedVariantId = selectedVariant.node.id
    let availableQuantity = selectedVariant.node.inventoryQuantity

    console.log('Available Quantity:', availableQuantity)

    if (selectedQuantity > availableQuantity) {
      setOutOfStockError(`Only ${availableQuantity} left in stock.`)
      return
    }

    addToBag(product, selectedVariantId, selectedProductSize, selectedQuantity)
    availableQuantity -= selectedQuantity
    setSelectedProduct(null)
    setSelectedSize({})
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
  const handleCloseModal = () => {
    setSelectedProduct(null)
    setSelectedSize({})
  }

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
              <div className="product-info">
                <h3 className="product-title">{product.title}</h3>
                <h3 className="product-price">
                  ${product.variants?.[0]?.node?.price || 'N/A'}
                </h3>
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
              <div className="product-details">
                <div className="product-info">
                  <h3 className="product-title">{selectedProduct.title}</h3>
                  <h3 className="product-price">
                    ${selectedProduct.variants?.[0]?.node?.price}
                  </h3>
                </div>
                <div className="product-options">
                  <label className="product-size">
                    Size:{' '}
                    <div className="size-select">
                      <button
                        className={`size-option ${
                          selectedSize[selectedProduct.id] === 'Small'
                            ? 'selected'
                            : ''
                        }`}
                        onClick={() =>
                          handleSizeChange(selectedProduct.id, 'Small')
                        }
                      >
                        Small
                      </button>
                      <button
                        className={`size-option ${
                          selectedSize[selectedProduct.id] === 'Medium'
                            ? 'selected'
                            : ''
                        }`}
                        onClick={() =>
                          handleSizeChange(selectedProduct.id, 'Medium')
                        }
                      >
                        Medium
                      </button>
                      <button
                        className={`size-option ${
                          selectedSize[selectedProduct.id] === 'Large'
                            ? 'selected'
                            : ''
                        }`}
                        onClick={() =>
                          handleSizeChange(selectedProduct.id, 'Large')
                        }
                      >
                        Large
                      </button>
                    </div>
                  </label>
                  <p className="product-color">
                    Color: {getOptionValue(selectedProduct, 'Color')}
                  </p>
                </div>
              </div>

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
