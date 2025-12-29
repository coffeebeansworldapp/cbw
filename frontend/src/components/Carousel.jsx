import React, { useEffect, useState, useRef } from 'react'

// Fallback slides if API fails
const fallbackSlides = [
  {
    title: 'Fresh Arabica Beans',
    subtitle: 'Direct from Ethiopian highlands to Abu Dhabi. Experience authentic single-origin coffee.',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=80',
    ctaLabel: 'Shop Now',
    ctaType: 'CATEGORY',
    ctaValue: 'all'
  },
  {
    title: 'Abu Dhabi Exclusive Blends',
    subtitle: 'Special blends crafted for UAE coffee lovers. Rich, intense, and ethically sourced.',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1600&q=80',
    ctaLabel: 'Explore Blends',
    ctaType: 'CATEGORY',
    ctaValue: 'premium'
  },
  {
    title: 'Subscribe & Save',
    subtitle: 'Get fresh coffee delivered across UAE. 15% discount for subscribers in Abu Dhabi.',
    imageUrl: 'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?auto=format&fit=crop&w=1600&q=80',
    ctaLabel: 'Learn More',
    ctaType: 'NONE'
  }
]

export default function Carousel() {
  const [index, setIndex] = useState(0)
  const [slides, setSlides] = useState(fallbackSlides)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  // Fetch carousel slides from API
  useEffect(() => {
    async function fetchSlides() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/public/carousel`)
        const data = await response.json()
        
        if (data.success && data.slides && data.slides.length > 0) {
          setSlides(data.slides)
        }
      } catch (error) {
        console.error('Failed to fetch carousel slides:', error)
        // Keep using fallback slides
      } finally {
        setLoading(false)
      }
    }
    
    fetchSlides()
  }, [])

  // Auto-rotate timer
  useEffect(() => {
    if (slides.length === 0) return
    
    timerRef.current = setInterval(() => setIndex(i => (i + 1) % slides.length), 5000)
    return () => clearInterval(timerRef.current)
  }, [slides.length])

  const handleSlideClick = (slide) => {
    if (slide.ctaType === 'NONE' || !slide.ctaValue) return

    switch (slide.ctaType) {
      case 'PRODUCT':
        window.location.href = `/products/${slide.ctaValue}`
        break
      case 'CATEGORY':
        window.location.href = `/#products?category=${slide.ctaValue}`
        break
      case 'COLLECTION':
        window.location.href = `/#products?collection=${slide.ctaValue}`
        break
      case 'URL':
        if (slide.ctaValue.startsWith('http')) {
          window.open(slide.ctaValue, '_blank')
        } else {
          window.location.href = slide.ctaValue
        }
        break
    }
  }

  if (slides.length === 0) {
    return null // Don't render if no slides
  }

  return (
    <div className="carousel-container" id="home">
      <div className="carousel-slides" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((slide, i) => (
          <div 
            className={`carousel-slide ${i === index ? 'active' : ''}`} 
            key={slide._id || i}
            onClick={() => handleSlideClick(slide)}
            style={{ cursor: slide.ctaType !== 'NONE' ? 'pointer' : 'default' }}
          >
            <img src={slide.imageUrl} alt={slide.title} />
            <div className="carousel-caption">
              <h3>{slide.title}</h3>
              {slide.subtitle && <p>{slide.subtitle}</p>}
              {slide.ctaLabel && slide.ctaType !== 'NONE' && (
                <button className="carousel-cta-btn">
                  {slide.ctaLabel}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button 
        className="carousel-btn carousel-prev" 
        onClick={() => setIndex(i => (i - 1 + slides.length) % slides.length)}
        aria-label="Previous slide"
      >
        &lt;
      </button>
      <button 
        className="carousel-btn carousel-next" 
        onClick={() => setIndex(i => (i + 1) % slides.length)}
        aria-label="Next slide"
      >
        &gt;
      </button>

      <div className="carousel-dots">
        {slides.map((_, i) => (
          <span 
            key={i} 
            className={`carousel-dot ${i === index ? 'active' : ''}`} 
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
