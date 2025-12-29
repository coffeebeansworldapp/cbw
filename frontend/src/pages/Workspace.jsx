import React from 'react'

export default function Workspace() {
  return (
    <div className="page">
      <section className="card" style={{marginTop:0}}>
        <h1>Work & Study at Coffee Beans World</h1>
        <p className="lead">Looking for a comfortable, work-friendly café with free Wi-Fi? Our space is designed for focus—without losing the warmth and hospitality that makes a great coffee shop feel premium.</p>

        <div className="grid">
          <div className="tile">
            <h3>Free Wi-Fi</h3>
            <p>Stable connectivity, perfect for meetings, study sessions, and getting real work done.</p>
          </div>
          <div className="tile">
            <h3>Comfort-First Seating</h3>
            <p>Relaxed corners and practical tables—ideal for laptops, notebooks, and long conversations.</p>
          </div>
          <div className="tile">
            <h3>Premium Coffee, Always</h3>
            <p>From espresso to slow brews, our baristas deliver consistent quality—cup after cup.</p>
          </div>
          <div className="tile">
            <h3>A Calm Atmosphere</h3>
            <p>A balanced environment that supports productivity while staying welcoming and social.</p>
          </div>
        </div>

        <div className="note" style={{marginTop:16}}>
          <strong>Abu Dhabi Location:</strong> Al Meena St - Al Zahiyah<br />
          <strong>Hours:</strong> Daily 7AM-11PM, Friday 8AM-12AM<br />
          <strong>Wi-Fi Password:</strong> Ask at the counter
        </div>

      </section>
    </div>
  )
}

