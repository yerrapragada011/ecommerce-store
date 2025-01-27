import React, { useState, useEffect } from 'react'
// import { useHistory } from 'react-router-dom'

const ProductList = ({ addToBag }) => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/shopify/products')
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

  if (loading) {
    return <p>Loading products...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <div>
      <h1>Products</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              width: '200px',
            }}
          >
            <img src={product.image?.src} alt={product.title} width="100%" />
            <h2>{product.title}</h2>
            <p>${product.variants[0].price}</p>
            <button onClick={() => addToBag(product)}>
              Add to Bag
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductList
