import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProductList from './components/ProductList'
import Bag from './components/Bag'
import Nav from './components/Nav'
import Footer from './components/Footer'
import './App.css'

const AppContent = () => {
  const [bagItems, setBagItems] = useState(() => {
    return JSON.parse(localStorage.getItem('bagItems')) || []
  })

  useEffect(() => {
    localStorage.setItem('bagItems', JSON.stringify(bagItems))
  }, [bagItems])

  const addToBag = (product, selectedVariantId, selectedSize, quantity) => {
    if (!selectedVariantId) {
      console.error('Selected Variant ID is missing!')
      return
    }

    setBagItems((prevItems) => {
      const existingProductIndex = prevItems.findIndex(
        (item) =>
          item.variantId === selectedVariantId && item.size === selectedSize
      )

      if (existingProductIndex !== -1) {
        return prevItems.map((item, index) =>
          index === existingProductIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        return [
          ...prevItems,
          {
            ...product,
            variantId: selectedVariantId,
            size: selectedSize,
            quantity,
          },
        ]
      }
    })
  }

  const updateQuantity = (variantId, size, newQuantity) => {
    setBagItems((prevItems) =>
      prevItems.map((item) =>
        item.variantId === variantId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const removeFromBag = (variantId, size) => {
    setBagItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.variantId === variantId && item.size === size)
      )
    )
  }

  const clearBag = () => {
    setBagItems([])
    localStorage.removeItem('bagItems') // Clear localStorage as well
  }

  return (
    <>
      <Nav bagItemCount={bagItems.length} />
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
              clearBag={clearBag}
            />
          }
        />
      </Routes>
      <Footer />
    </>
  )
}

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
