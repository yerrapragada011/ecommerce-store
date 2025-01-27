import React, { useState, useEffect } from 'react'

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
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }))
  }

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                placeholder="Quantity"
                value={quantities[product.id] ?? 1}
                onChange={(e) =>
                  handleQuantityChange(product.id, e.target.value)
                }
                style={{
                  width: '60px',
                  textAlign: 'center',
                }}
              />
              <button onClick={() => handleAddToBag(product)}>
                Add to Bag
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductList
