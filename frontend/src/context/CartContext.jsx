import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cbw-cart')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('cbw-cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product, size, quantity, variantPrice) => {
    console.log('CartContext addToCart called:', { product, size, quantity, variantPrice })
    const cartItemId = `${product.id}-${size}`
    console.log('Generated cartItemId:', cartItemId)
    
    setCartItems(prevItems => {
      console.log('Previous cart items:', prevItems)
      const existingItem = prevItems.find(item => item.cartItemId === cartItemId)
      
      if (existingItem) {
        console.log('Existing item found, updating quantity')
        return prevItems.map(item =>
          item.cartItemId === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      
      const newItem = {
        cartItemId,
        productId: product.id,
        name: product.name,
        image: product.image,
        region: product.region,
        size,
        price: variantPrice,
        quantity
      }
      console.log('Adding new item to cart:', newItem)
      return [...prevItems, newItem]
    })
  }

  const removeFromCart = (cartItemId) => {
    setCartItems(prevItems => prevItems.filter(item => item.cartItemId !== cartItemId))
  }

  const updateQuantity = (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(cartItemId)
      return
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const cartTotal = cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity)
  }, 0)

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartTotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}
