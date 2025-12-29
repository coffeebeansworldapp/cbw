import React from 'react'

export default function Stores(){
  return (
    <div className="page">
      <section className="card" style={{marginTop:0}}>
        <h1>Our Stores</h1>

        <div style={{display:'grid',gap:18,marginTop:18}}>
          <article className="tile" style={{padding:18}}>
            <h3>Coffee Beans World — Al Meena St - Al Zahiyah</h3>
            <p style={{marginTop:8}}>Store Address<br/>
            Coffee Beans World Al Meena St - Al Zahiyah<br/>
            00000 Abu Dhabi<br/>
            United Arab Emirates</p>

            <p style={{marginTop:8}}><strong>Store Contacts</strong><br/>+971 2 559 9844<br/>info@coffeebeansworld.ae</p>

            <div style={{marginTop:8}}>
              <strong>Opening Hours</strong>
              <table style={{width:'100%',marginTop:8,borderCollapse:'collapse'}}>
                <tbody>
                  {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d=> (
                    <tr key={d}><td style={{padding:'4px 6px',width:140}}>{d}</td><td style={{padding:'4px 6px'}}>07:00 AM - 12:00 AM</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          <article className="tile" style={{padding:18}}>
            <h3>Coffee Beans World — Al Raha</h3>
            <p style={{marginTop:8}}>Address: CHWW+Q4J - Al Rahah - Al Seef - Abu Dhabi</p>
            <p style={{marginTop:8}}>Phone: 02 631 2574</p>
            <div style={{marginTop:8}}>
              <strong>Hours</strong>
              <table style={{width:'100%',marginTop:8,borderCollapse:'collapse'}}>
                <tbody>
                  {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d=> (
                    <tr key={d}><td style={{padding:'4px 6px',width:140}}>{d}</td><td style={{padding:'4px 6px'}}>07:00 AM - 10:00 PM</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </div>

      </section>
    </div>
  )
}
