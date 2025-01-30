import React, { useState, useEffect } from 'react'
import './ProductList.css'

const ProductList = ({ addToBag }) => {
  const [products, setProducts] = useState([])
  const [quantities, setQuantities] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
    const quantity = quantities[product.id] > 0 ? quantities[product.id] : 1
    addToBag(product, quantity)
    alert('Added to bag!')
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }))
  }

  if (loading) {
    return <p className="loading">Loading products...</p>
  }

  if (error) {
    return <p>{error}</p>
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
              <h2>{product.title}</h2>
              <p>${product.variants.edges[0]?.node.price}</p>
              <div className="product-actions">
                <input
                  type="text"
                  placeholder="Quantity"
                  value={quantities[product.id] ?? 1}
                  onChange={(e) =>
                    handleQuantityChange(product.id, e.target.value)
                  }
                  className="quantity-input"
                />
                <button onClick={() => handleAddToBag(product)}>
                  Add to Bag
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductList
