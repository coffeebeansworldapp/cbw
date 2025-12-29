import React from 'react'

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-main">
        {/* Column 1: Logo & Contact */}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <img src="/images/cbw-logo.png" alt="Coffee Beans World" style={{height:54, borderRadius:8}} />
          </div>

          <div style={{color:'rgba(255,255,255,0.9)'}}>
            <div>Al Meena St - Al Zahiyah Abu Dhabi United Arab Emirates</div>
          </div>

          <div style={{display:'flex',gap:18,alignItems:'center'}}>
            <div>+97125599844</div>
            <div>info@coffeebeansworld.ae</div>
          </div>

          <div style={{display:'flex',gap:12}}>
            <button style={{background:'#fff',borderRadius:6,padding:'8px 12px', cursor:'pointer'}}>App Store</button>
            <button style={{background:'#fff',borderRadius:6,padding:'8px 12px', cursor:'pointer'}}>Google Play</button>
          </div>
        </div>

        {/* Column 2: More Info */}
        <div className="footer-section">
          <h4>More Info</h4>
          <ul>
            <li><a href="#">Contact us</a></li>
            <li><a href="#">Sitemap</a></li>
            <li><a href="/stores">Stores</a></li>
          </ul>
        </div>

        {/* Column 3: Company */}
        <div className="footer-section">
          <h4>Our company</h4>
          <ul>
            <li><a href="#">Delivery</a></li>
            <li><a href="#">Terms and conditions of use</a></li>
            <li><a href="#">About us</a></li>
            <li><a href="#">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Column 4: Account */}
        <div className="footer-links-column">
          <h4>Your account</h4>
          <ul>
            <li><a href="#">Personal info</a></li>
            <li><a href="#">Orders</a></li>
            <li><a href="#">Credit slips</a></li>
            <li><a href="#">Addresses</a></li>
            <li><a href="#">Vouchers</a></li>
          </ul>
        </div>

        {/* Column 5: Newsletter */}
        <div className="footer-links-column">
          <h4>Newsletter Signup</h4>
          <div className="newsletter">
            <p style={{fontSize:13, lineHeight:1.4, marginBottom:10}}>You may unsubscribe at any moment.</p>
            <form className="newsletter-form" onSubmit={(e)=>{e.preventDefault(); alert('Subscribed!'); e.currentTarget.reset()}}>
              <input type="email" placeholder="Your email address" required />
              <button type="submit">→</button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} - Coffee Beans World Abu Dhabi United Arab Emirates</p>
      </div>
    </footer>
  )
}
