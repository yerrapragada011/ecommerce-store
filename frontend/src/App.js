import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProductList from './components/ProductList'
import Bag from './components/Bag'
import './App.css'

const App = () => {
  const [bagItems, setBagItems] = useState(() => {
    return JSON.parse(localStorage.getItem('bagItems')) || []
  })

  useEffect(() => {
    localStorage.setItem('bagItems', JSON.stringify(bagItems))
  }, [bagItems])

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
