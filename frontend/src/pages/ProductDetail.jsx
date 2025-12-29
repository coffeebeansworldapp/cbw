import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { fetchProductById } from '../services/api'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState('500g')
  const [quantity, setQuantity] = useState(1)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchProductById(id)
        setProduct(data)
        // Set initial selected size to first variant
        if (data.variants && data.variants.length > 0) {
          setSelectedSize(data.variants[0].label)
        }
      } catch (err) {
        console.error('Failed to load product:', err)
        setError('Product not found')
      } finally {
        setLoading(false)
      }
    }
    loadProduct()
  }, [id])

  if (loading) {
    return (
      <div className="pdp-wrapper">
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--cream)' }}>
          Loading product...
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="pdp-wrapper">
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--cream)' }}>
          <h2>Product not found</h2>
          <button 
            className="pdp-back-btn" 
            style={{ marginTop: '20px' }}
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    )
  }

  // Get the current variant based on selected size
  const currentVariant = product?.variants?.find(v => v.label === selectedSize)
  const currentPrice = currentVariant?.price || product?.basePrice || 0
  const totalPrice = currentPrice * quantity

  const handleAddToCart = () => {
    console.log('Adding to cart:', { product, selectedSize, quantity, currentPrice, totalPrice })
    addToCart(product, selectedSize, quantity, currentPrice)
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 3000)
  }

  // Check if it's Jamaica Blue Mountain for special styling
  const isJamaica = product.name?.toLowerCase().includes('jamaica')

  return (
    <div className="pdp-wrapper">
      {/* Success Popup */}
      {showPopup && (
        <div className="cart-success-popup">
          <div className="cart-success-content">
            <span className="cart-success-icon">✓</span>
            Beans Added Successfully to cart
          </div>
        </div>
      )}
      
      <div className="pdp-container">
        
        <div className="pdp-card">
          
          {/* Left Column - Content */}
          <div className="pdp-content">
            
            <button 
              className="pdp-back-btn"
              onClick={() => navigate('/')}
            >
              ← Back to Home
            </button>
            
            <h1 className="pdp-title">{product.name}</h1>
            
            <p className="pdp-description">{product.description}</p>
            
            {/* Info Grid */}
            <div className="pdp-info-grid">
              <div className="pdp-info-item">
                <span className="pdp-info-label">ORIGIN:</span>
                <span className="pdp-info-value">{product.region}</span>
              </div>
              <div className="pdp-info-item">
                <span className="pdp-info-label">ROAST:</span>
                <span className="pdp-info-value">{product.roast}</span>
              </div>
              <div className="pdp-info-item">
                <span className="pdp-info-label">PROCESSING:</span>
                <span className="pdp-info-value">{product.processing || 'Washed'}</span>
              </div>
              <div className="pdp-info-item pdp-info-item--wide">
                <span className="pdp-info-label">TASTING NOTES:</span>
                <span className="pdp-info-value">
                  {product.tastingNotes || 'Smooth body, mild acidity, sweet floral undertones with hints of chocolate and nuts. Best enjoyed as pour-over, cold brew or espresso.'}
                </span>
              </div>
            </div>
            
            {/* Size Selection */}
            <div className="pdp-size-group">
              <label className="pdp-label">Select Size:</label>
              <div className="pdp-size-options">
                {product.variants?.map(variant => (
                  <button
                    key={variant.label}
                    className={`pdp-size-btn ${selectedSize === variant.label ? 'active' : ''}`}
                    onClick={() => setSelectedSize(variant.label)}
                  >
                    {variant.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quantity */}
            <div className="pdp-qty-group">
              <label className="pdp-label">Quantity:</label>
              <div className="pdp-qty-box">
                <button 
                  className="pdp-qty-btn"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  −
                </button>
                <span className="pdp-qty-num">{quantity}</span>
                <button 
                  className="pdp-qty-btn"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Price & CTA */}
            <div className="pdp-footer">
              <div className="pdp-price-box">
                <div className="pdp-price">AED {currentPrice}</div>
                <div className="pdp-price-note">per {selectedSize}</div>
              </div>
              
              <div className="pdp-total">Total: AED {totalPrice}</div>
              
              <button 
                className="pdp-add-btn"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
            
          </div>
          
          {/* Right Column - Media */}
          <div className="pdp-media">
            <img 
              src={product.image} 
              alt={product.name}
              className={`pdp-image${isJamaica ? ' pdp-image--jamaica' : ''}`}
              loading="lazy"
            />
          </div>
          
        </div>
        
      </div>
    </div>
  )
}
