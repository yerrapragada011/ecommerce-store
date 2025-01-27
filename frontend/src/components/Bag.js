import React from 'react'

const Bag = ({ items, removeFromBag }) => {
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
                <p>${item.variants[0].price}</p>
                <button onClick={() => removeFromBag(index)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Bag
