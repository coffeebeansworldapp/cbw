import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const navigate = useNavigate()
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart()



  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h1>Your Cart is Empty</h1>
          <p>Add some premium coffee to get started!</p>
          <button onClick={() => navigate('/')} className="cart-continue-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <button onClick={clearCart} className="cart-clear-btn">Clear All</button>
        </div>

        <div className="cart-items">
          {cartItems.map(item => {
            const itemPrice = item.price
            const itemTotal = itemPrice * item.quantity

            return (
              <div key={item.cartItemId} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-region">{item.region}</p>
                  <p className="cart-item-size">Size: {item.size}</p>
                </div>

                <div className="cart-item-price">
                  <span>AED {itemPrice}</span>
                </div>

                <div className="cart-item-quantity">
                  <button 
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    className="cart-qty-btn"
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="cart-qty-btn"
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-total">
                  <span>AED {itemTotal}</span>
                </div>

                <button 
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="cart-item-remove"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>

        <div className="cart-summary">
          <div className="cart-summary-row">
            <span>Subtotal:</span>
            <span>AED {Math.round(cartTotal)}</span>
          </div>
          <div className="cart-summary-row">
            <span>Shipping:</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="cart-summary-total">
            <span>Total:</span>
            <span>AED {Math.round(cartTotal)}</span>
          </div>
          
          <button className="cart-checkout-btn">
            Proceed to Checkout
          </button>
          
          <button onClick={() => navigate('/')} className="cart-continue-btn">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}
