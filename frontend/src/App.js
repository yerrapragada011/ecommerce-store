import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import ProductList from './components/ProductList'
import Bag from './components/Bag'
import './App.css'

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
    <Router>
      <nav className='nav'>
        <Link to="/">Home</Link>
        <Link to="/bag">Bag</Link>
      </nav>
      <Routes>
        <Route
          path="/"
          element={<ProductList addToBag={addToBag} bagItems={bagItems} />}
        />
        <Route
          path="/bag"
          element={
            <Bag
              items={bagItems}
              updateQuantity={updateQuantity}
              removeFromBag={removeFromBag}
            />
          }
        />
      </Routes>
    </Router>
  )
}

export default App
