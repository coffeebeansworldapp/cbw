import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { CartProvider, useCart } from './context/CartContext'
import logo from './assets/cbw-logo.svg'
import Home from './pages/Home'
import About from './pages/About'
import Vision from './pages/Vision'
import Mission from './pages/Mission'
import Workspace from './pages/Workspace'
import Stores from './pages/Stores'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Footer from './components/Footer'

function AppContent() {
  const { cartCount } = useCart()

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <img
              src="/images/cbw-logo.png"
              alt="Coffee Beans World"
              className="cbw-logo"
              style={{ height: 56 }}
              onError={(e) => {
                e.currentTarget.onerror = null
                e.currentTarget.src = logo
              }}
            />
          </div>

          <nav className="app-nav">
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/vision">Vision</Link>
            <Link to="/mission">Mission</Link>
            <Link to="/workspace">Workspace</Link>
            <Link to="/stores">Stores</Link>

            <Link to="/cart" className="cart-link">
              🛒 Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </nav>
        </div>
      </header>

      {/* ✅ No inline padding here */}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/vision" element={<Vision />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/workspace" element={<Workspace />} />
          <Route path="/stores" element={<Stores />} />
        </Routes>
      </main>

      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  )
}
