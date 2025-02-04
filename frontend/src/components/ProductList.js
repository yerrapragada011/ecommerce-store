import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './ProductList.css'

const ProductList = ({ addToBag, bagItems }) => {
  const [products, setProducts] = useState([])
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

  const handleAddToBag = (product) => {
    if (!bagItems.some((item) => item.id === product.id)) {
      addToBag(product, 1)
    }
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
              <p>{product.title}</p>
              <div className="product-details">
                <p>${product.variants.edges[0]?.node.price}</p>
                <Link to="/bag" onClick={() => handleAddToBag(product)}>
                  <button className="product-info-button">Buy now</button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductList
