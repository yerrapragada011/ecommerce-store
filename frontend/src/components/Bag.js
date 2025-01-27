import React from 'react'

const Bag = ({ items, updateQuantity, removeFromBag }) => {
  const totalPrice = items.reduce(
    (sum, item) => sum + item.variants[0].price * item.quantity,
    0
  )

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
                <p>Price: ${item.variants[0].price}</p>
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
          </div>
        )}
      </div>
    </div>
  )
}

export default Bag
