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
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <Link to="/">
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
            </Link>
          </div>

          <button 
            className="menu-toggle" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className={`hamburger ${isMenuOpen ? 'active' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>

          <nav className={`app-nav ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/about" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link to="/vision" onClick={() => setIsMenuOpen(false)}>Vision</Link>
            <Link to="/mission" onClick={() => setIsMenuOpen(false)}>Mission</Link>
            <Link to="/workspace" onClick={() => setIsMenuOpen(false)}>Workspace</Link>
            <Link to="/stores" onClick={() => setIsMenuOpen(false)}>Stores</Link>

            <Link to="/cart" className="cart-link" onClick={() => setIsMenuOpen(false)}>
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
