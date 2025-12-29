import React, { useState, useEffect, useRef } from 'react'
import Carousel from '../components/Carousel'
import WorldMap from '../components/WorldMap'
import { Link, useNavigate } from 'react-router-dom'
import { fetchProducts, fetchPremiumBeans } from '../services/api'

// Fallback data in case API fails
const fallbackPremiumBeans = [
  {
    beanId: "jamaica",
    kicker: "Coffee Beans World • Premium Collection",
    titleMain: "Jamaica",
    titleSub: "Blue Mountain",
    desc: "Rare, high-grade beans with a smooth body, balanced acidity, and a clean finish. Roasted with precision for coffee lovers who want a truly premium cup.",
    pills: ["• 100% Arabica", "Roast: Medium", "Origin: Jamaica"],
    image: "/images/Jamica.png",
    imgScale: 1.0,
    imgX: 0,
  },
];

const fallbackProducts = [
  { _id: '1', name: "Ethiopian Yirgacheffe", category: "africa", region: "Ethiopia", basePrice: 85, roast: "Light", image: "/images/premium-beans.png" },
  { _id: '2', name: "Colombian Supremo", category: "america", region: "Colombia", basePrice: 75, roast: "Medium", image: "/images/premium-beans.png" },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState(null)
  const navigate = useNavigate()
  
  // State for API data
  const [premiumBeans, setPremiumBeans] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [index, setIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const intervalRef = useRef(null);

  // Fetch data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [beansData, productsData] = await Promise.all([
          fetchPremiumBeans(),
          fetchProducts()
        ]);
        setPremiumBeans(beansData.length > 0 ? beansData : fallbackPremiumBeans);
        setProducts(productsData.length > 0 ? productsData : fallbackProducts);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err.message);
        // Use fallback data
        setPremiumBeans(fallbackPremiumBeans);
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Refetch products when category changes (optional - can filter client-side instead)
  useEffect(() => {
    async function loadProducts() {
      try {
        // If a country is selected, load all products to filter by country
        const categoryToFetch = selectedCountry ? 'all' : activeCategory;
        const productsData = await fetchProducts(categoryToFetch);
        setProducts(productsData.length > 0 ? productsData : fallbackProducts);
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    }
    if (!loading) {
      loadProducts();
    }
  }, [activeCategory, selectedCountry]);

  const handleCountryClick = (countryName, countryCode) => {
    console.log('Country clicked:', countryName, countryCode);
    setSelectedCountry(countryName);
    // Reset category to 'all' to show all products from that country
    setActiveCategory('all');
  }

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setSelectedCountry(null); // Reset country selection when category changes
  }

  // Filter products based on selected country or category
  const filteredProducts = selectedCountry 
    ? products.filter(product => product.region === selectedCountry)
    : products;

  const bean = premiumBeans[index] || fallbackPremiumBeans[0];

  // Preload images (prevents flicker on swap)
  useEffect(() => {
    premiumBeans.forEach((b) => {
      const img = new Image();
      img.src = b.image;
    });
  }, [premiumBeans]);

  useEffect(() => {
    if (premiumBeans.length === 0) return;

    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const intervalMs = 4800;
    const fadeMs = prefersReduced ? 0 : 320;

    function next() {
      if (prefersReduced) {
        setIndex((i) => (i + 1) % premiumBeans.length);
        return;
      }

      setFadeOut(true);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % premiumBeans.length);
        setFadeOut(false);
      }, fadeMs);
    }

    intervalRef.current = window.setInterval(next, intervalMs);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [premiumBeans.length]);

  const mediaTransform = `translateX(${bean.imgX || 0}px) scale(${bean.imgScale || 1})`;
  
  return (
    <div>
      <Carousel />

      <div className="page">
        <div className="main-content">

{/* PREMIUM HERO ROTATOR */}
<section className="cbw-jamaica" id="premiumHero">
  <div className="cbw-jamaica__wrap">
    <div className="cbw-jamaica__panel">
      <div className="cbw-jamaica__left">
        <div className="cbw-jamaica__topline">
          <span className="cbw-jamaica__sprout">✦</span>
          <span>Coffee Beans World • Premium Collection</span>
        </div>

        {/* Only this part fades */}
        <div className={"cbw-jamaica__dynamic " + (fadeOut ? "is-fading" : "")}>
          <div className="cbw-jamaica__title">
            <span className="cbw-jamaica__titleJ">{bean.titleMain}</span>
            <span className="cbw-jamaica__titleBM">{bean.titleSub}</span>
          </div>

          <p className="cbw-jamaica__desc">{bean.desc}</p>
        </div>

        <div className="cbw-jamaica__chips">
          {(bean.pills || []).map((p, idx) => (
            <span className="cbw-jamaica__chip" key={idx}>
              {p}
            </span>
          ))}
        </div>

        <Link className="cbw-jamaica__cta cta" to={`/stores`}>
          Shop Collection
        </Link>
      </div>

      <div
        className={
          "cbw-jamaica__scene " + (fadeOut ? "is-fading" : "")
        }
      >
        <div className="cbw-jamaica__halo" aria-hidden="true" />

        {/* Stage normalizes all images */}
        <div className="cbw-jamaica__stage">
          <img
            className="cbw-jamaica__pack"
            src={bean.image}
            alt={`${bean.titleMain} ${bean.titleSub}`}
            style={{ transform: mediaTransform }}
            draggable="false"
          />
        </div>

        <span className="cbw-jamaica__floor" aria-hidden="true" />
      </div>
    </div>
  </div>
</section>

{/* Product Showcase Section */}
<section className="product-showcase">
  <div className="product-showcase__container">
    <h2 className="product-showcase__title">Our Coffee Collection</h2>
    
    <div className="product-showcase__filters">
      <button 
        className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
        onClick={() => handleCategoryChange('all')}
      >
        All
      </button>
      <button 
        className={`filter-btn ${activeCategory === 'asia' ? 'active' : ''}`}
        onClick={() => handleCategoryChange('asia')}
      >
        Asia
      </button>
      <button 
        className={`filter-btn ${activeCategory === 'africa' ? 'active' : ''}`}
        onClick={() => handleCategoryChange('africa')}
      >
        Africa
      </button>
      <button 
        className={`filter-btn ${activeCategory === 'america' ? 'active' : ''}`}
        onClick={() => handleCategoryChange('america')}
      >
        America
      </button>
      <button 
        className={`filter-btn ${activeCategory === 'premium' ? 'active' : ''}`}
        onClick={() => handleCategoryChange('premium')}
      >
        Premium Beans
      </button>
    </div>
    
    {/* World Map */}
    <WorldMap 
      selectedRegion={
        activeCategory === 'all' ? null :
        activeCategory === 'asia' ? 'Asia' :
        activeCategory === 'africa' ? 'Africa' :
        activeCategory === 'america' ? 'America' :
        null
      }
      selectedCountry={selectedCountry}
      onCountryClick={handleCountryClick}
      onClearCountry={() => setSelectedCountry(null)}
    />
    
    {loading ? (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--cream)' }}>
        Loading products...
      </div>
    ) : (
      <div className="product-showcase__grid">
        {filteredProducts.map(product => (
          <article 
            key={product._id} 
            className="product-card"
            onClick={() => navigate(`/product/${product._id}`)}
          >
            <div className="product-card__image">
              <img src={product.image} alt={product.name} loading="lazy" />
            </div>
            <div className="product-card__content">
              <h3 className="product-card__name">{product.name}</h3>
              <p className="product-card__region">{product.roast} roast, {product.region}</p>
              <div className="product-card__footer">
                <span className="product-card__price">AED {product.variants?.[0]?.price || product.basePrice}</span>
                <button 
                  className="product-card__btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/product/${product._id}`);
                  }}
                >
                  Add to cart
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    )}
  </div>
</section>

          <section className="cards">


            <article className="card c-brown">
              <div className="inner">
                <div className="badge">★</div>
                <h4>Abu Dhabi Blend</h4>
                <p>Our signature blend crafted for UAE taste preferences</p>
              </div>
            </article>

            <article className="card c-brown">
              <div className="inner">
                <div className="badge">🛡️</div>
                <h4>Organic Selection</h4>
                <p>Certified organic fair trade coffee from Peru</p>
              </div>
            </article>

            <article className="card photo">
              <img src="/images/premium-beans.png" alt="Premium beans" />
            </article>

            <article className="card c-brown">
              <div className="inner">
                <div className="badge">♻️</div>
                <h4>Sustainable Packaging</h4>
                <p>Eco-friendly compostable packaging materials</p>
              </div>
            </article>

            <article className="card c-tan">
              <div className="inner">
                <div className="badge">⚙️</div>
                <h4>Coffee Equipment</h4>
                <p>Professional grinders and brewers for home use</p>
              </div>
            </article>
          </section>


        </div>
      </div>
    </div>
  )
}
