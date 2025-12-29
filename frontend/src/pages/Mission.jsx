import React from 'react'

export default function Mission() {
  return (
    <div className="page">
      <section className="card" style={{marginTop:0}}>
        <h1>Our Mission</h1>
        <p className="lead">Serve everyone better than anyone else—through remarkable coffee, reliable consistency, and hospitality that feels genuine.</p>

        <div className="grid" style={{marginTop:18}}>
          <div className="tile">
            <div style={{display:'flex',alignItems:'center',gap:10, marginBottom:8}}><span style={{width:10,height:10,background:'#D7AA7F',borderRadius:999}}></span><h3>Success</h3></div>
            <p>Deliver premium coffee beans and products with excellent service, consistent quality, and thoughtful value.</p>
          </div>
          <div className="tile">
            <div style={{display:'flex',alignItems:'center',gap:10, marginBottom:8}}><span style={{width:10,height:10,background:'#D7AA7F',borderRadius:999}}></span><h3>Integrity</h3></div>
            <p>Stay authentic and do the right thing—showing ethics, honesty, and fair dealing in every relationship.</p>
          </div>
          <div className="tile">
            <div style={{display:'flex',alignItems:'center',gap:10, marginBottom:8}}><span style={{width:10,height:10,background:'#D7AA7F',borderRadius:999}}></span><h3>Passion</h3></div>
            <p>Maintain our commitment to crafting and marketing quality products—grounded in traditional values and modern excellence.</p>
          </div>
        </div>

      </section>
    </div>
  )
}

