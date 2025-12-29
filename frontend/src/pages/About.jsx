import React from 'react'

export default function About() {
  return (
    <div className="page">
      <section className="card" style={{marginTop:0}}>
        <h1>About Coffee Beans World</h1>
        <p className="lead">
          Coffee Beans World began with a simple idea: bring truly great coffee to the UAE—roasted locally, served with pride,
          and built around an experience people want to return to.
        </p>

        <p className="p">
          Founded by a well-known UAE entrepreneur with multiple ventures across the region, the brand was created after noticing
          a gap in the market: many international coffee labels existed, but few were originally established here with a commitment
          to local roasting and consistent quality.
        </p>

        <p className="p">
          As coffee culture accelerated across the UAE, we set out to serve coffee lovers with a stronger promise—high-grade beans,
          careful sourcing, and a roasting approach that respects origin character. We roast using a drum roaster and maintain consistency
          through continuous profiling, cupping, and close coordination with producers at the farm.
        </p>

        <p className="p">
          Coffee Beans World is also built for growth. With more branches planned across UAE cities, our focus remains the same:
          a premium, welcoming coffee experience—specialty and commercial options—delivered with authentic hospitality.
        </p>

        <div className="grid" style={{marginTop:18}}>
          <div className="tile">
            <h3>Quality & Consistency</h3>
            <p>High-grade selection, repeatable profiles, and ongoing cupping to keep every roast clean and dependable.</p>
          </div>
          <div className="tile">
            <h3>People & Craft</h3>
            <p>A multicultural team skilled in roasting and brewing, trained to deliver coffee at its best—every day.</p>
          </div>
          <div className="tile">
            <h3>Local Roast, Global Beans</h3>
            <p>Freshness matters. We roast in the UAE to bring out sweetness, aroma, and balance across roast levels.</p>
          </div>
          <div className="tile">
            <h3>Expansion with Purpose</h3>
            <p>More locations, same promise: premium coffee, warm service, and a space that feels effortlessly comfortable.</p>
          </div>
        </div>

      </section>
    </div>
  )
}
