import React from 'react'

const Bag = ({ items, updateQuantity, removeFromBag }) => {
  const totalPrice = items.reduce((sum, item) => {
    const price = item.variants.edges[0]?.node.price
      ? parseFloat(item.variants.edges[0]?.node.price)
      : 0
    return sum + price * item.quantity
  }, 0)

  const proceedToCheckout = async () => {
    try {
      const lineItems = items.map((item) => ({
        variant_id: item.variants[0].id,
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

  return (
    <div>
      <h1>Your Bag</h1>
      <div>
        {items.length === 0 ? (
          <p>Your bag is empty.</p>
        ) : (
          <div>
            {items.map((item, index) => (
              <div key={index} style={{ marginBottom: '20px' }}>
                <h3>{item.title}</h3>
                <p>Price: ${item.variants.edges[0]?.node.price || 'N/A'}</p>

                <p>Quantity: {item.quantity}</p>
                <button
                  onClick={() => updateQuantity(index, item.quantity - 1)}
                  disabled={item.quantity === 1}
                >
                  -
                </button>
                <button
                  onClick={() => updateQuantity(index, item.quantity + 1)}
                >
                  +
                </button>
                <button onClick={() => removeFromBag(index)}>Remove</button>
              </div>
            ))}
            <h2>Total: ${totalPrice.toFixed(2)}</h2>
            <button
              onClick={proceedToCheckout}
              style={{
                marginTop: '20px',
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Bag
