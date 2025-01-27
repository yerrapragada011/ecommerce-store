import React, { useState } from 'react'
import ProductList from './components/ProductList'
import Bag from './components/Bag'

function App() {
  const [bag, setBag] = useState([])

  const addToBag = (product) => {
    setBag((prevBag) => [...prevBag, product])
  }

  const removeFromBag = (index) => {
    setBag((prevBag) => prevBag.filter((_, i) => i !== index))
  }

  return (
    <div>
      <h1>Welcome to the React App!</h1>
      <ProductList addToBag={addToBag} />
      <Bag items={bag} removeFromBag={removeFromBag} />
    </div>
  )
}

export default App
