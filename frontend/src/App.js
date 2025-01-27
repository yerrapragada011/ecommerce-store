import React, { useState } from 'react'
import ProductList from './components/ProductList'
import Bag from './components/Bag'

const App = () => {
  const [bagItems, setBagItems] = useState([])

  const addToBag = (product, quantity) => {
    setBagItems((prevItems) => {
      const existingProductIndex = prevItems.findIndex(
        (item) => item.id === product.id
      )

      if (existingProductIndex !== -1) {
        const updatedItems = prevItems.map((item, index) =>
          index === existingProductIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
        return updatedItems
      } else {
        return [...prevItems, { ...product, quantity }]
      }
    })
  }

  const updateQuantity = (index, quantity) => {
    setBagItems((prevItems) => {
      const updatedItems = [...prevItems]
      if (quantity > 0) {
        updatedItems[index].quantity = quantity
      } else {
        updatedItems.splice(index, 1)
      }
      return updatedItems
    })
  }

  const removeFromBag = (index) => {
    setBagItems((prevItems) => {
      const updatedItems = [...prevItems]
      updatedItems.splice(index, 1)
      return updatedItems
    })
  }

  return (
    <div>
      <h1>Welcome to the React App!</h1>
      <ProductList addToBag={addToBag} bagItems={bagItems} />
      <Bag
        items={bagItems}
        updateQuantity={updateQuantity}
        removeFromBag={removeFromBag}
      />
    </div>
  )
}

export default App
