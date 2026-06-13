/* global React */
const { useState, useEffect, useRef, useMemo } = React;

/* ----------------------------- Project data ----------------------------- */
const PROJECT = {
  totalFeet: 2000,
  costPerFoot: 2706,            // LKR per linear foot
  totalBudget: 5412000,        // LKR (2,000 ft × 2,706)
  fullLengthFt: 1900,
  fullLengthKm: 1.9,
  width: 8,                    // ft
  thickness: 4,                // in
  mapUrl: "https://maps.app.goo.gl/ZbSeubxqA7pg2tbQ6",
};

const COST_LINES = [
  { mat: "Cement", sub: "50kg standard bags · 1:3:5 mix", qty: "0.440 bags", rate: "2,050.00", total: "902.00" },
  { mat: "River Sand", sub: "Fine aggregate", qty: "0.016 cubes", rate: "26,000.00", total: "416.00" },
  { mat: "Coarse Aggregate", sub: "Crushed metal", qty: "0.028 cubes", rate: "21,000.00", total: "588.00" },
  { mat: "Direct On-site Labour", sub: "Fixed allocation", qty: "—", rate: "—", total: "800.00" },
];

/* ----------------------------- Formatting ------------------------------- */
const fmt = (n) => Math.round(n).toLocaleString("en-US");
const LKR = ({ children }) => (<span><span className="lkr">LKR</span> {children}</span>);

/* ----------------------------- Icons ------------------------------------ */
function Lotus({ className }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M32 50c-9 0-17-5-20-12 4-2 9-2 13 0" stroke="var(--saffron)"/>
      <path d="M32 50c9 0 17-5 20-12-4-2-9-2-13 0" stroke="var(--saffron)"/>
      <path d="M32 50c-6-3-10-9-10-16 0-4 2-8 4-11" stroke="var(--forest-3)"/>
      <path d="M32 50c6-3 10-9 10-16 0-4-2-8-4-11" stroke="var(--forest-3)"/>
      <path d="M32 50c-3-4-4-10-4-16 0-7 2-13 4-18 2 5 4 11 4 18 0 6-1 12-4 16z" stroke="var(--forest)"/>
    </svg>
  );
}
function Ico({ d, className }) {
  return (<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>);
}
const ICONS = {
  ruler: "M3 9l3-3 12 12-3 3zM9 6l1.5 1.5M12 9l1.5 1.5M15 12l1.5 1.5",
  width: "M3 12h18M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3",
  layers: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5",
  mix: "M5 22V8l7-5 7 5v14M5 12h14M9 22v-6h6v6",
  pin: "M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z M12 10a0 0 0 100 0",
  check: "M20 6L9 17l-5-5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  heart: "M20.8 5.6a5.5 5.5 0 00-7.8 0L12 6.6l-1-1a5.5 5.5 0 10-7.8 7.8l1 1L12 22l7.8-7.6 1-1a5.5 5.5 0 000-7.8z",
};

/* ----------------------------- NAV -------------------------------------- */
function Nav() {
  return (
    <header className="nav">
      <div className="wrap nav__inner">
        <a className="brand" href="#top">
          <Lotus className="brand__mark" />
          <span className="brand__txt">
            <span className="brand__name">Rideekanda</span>
            <span className="brand__sub">Forest Monastery</span>
          </span>
        </a>
        <nav className="nav__links">
          <a href="#about">The Project</a>
          <a href="#specs">Engineering</a>
          <a href="#road">Pave the Road</a>
          <a href="#budget">Budget</a>
          <a className="btn btn--saffron nav__cta" href="#road">Pledge a Foot</a>
        </nav>
      </div>
    </header>
  );
}

/* ----------------------------- HERO ------------------------------------- */
function Hero({ stats }) {
  return (
    <section className="hero" id="top">
      <div className="wrap hero__inner center">
        <div className="hero__lotus"><Lotus /></div>
        <p className="kicker kicker--center">A Path to Stillness</p>
        <h1>Paving the road to the <span className="h-em">forest monastery</span>.</h1>
        <p className="hero__lede">
          A quiet gravel track winds 1.9&nbsp;km through the forest to Rideekanda Monastery.
          Help us lay <strong>2,000&nbsp;feet</strong> of concrete — one linear foot at a time —
          so that meditation practitioners may walk and travel in peace.
        </p>
        <div className="hero__cta">
          <a className="btn btn--saffron" href="#road">Pledge a linear foot <Ico d={ICONS.arrow} className="btn__ico" style={{width:18,height:18}}/></a>
          <a className="btn btn--ghost" href="#about">Learn about the project</a>
        </div>
        <div className="hero__stats">
          <div className="hero__stat"><div className="num">1.9<small style={{fontSize:18}}>km</small></div><div className="lbl">Full road length</div></div>
          <div className="hero__stat"><div className="num">2,000<small style={{fontSize:18}}>ft</small></div><div className="lbl">Concrete to be laid</div></div>
          <div className="hero__stat"><div className="num">{stats.pavedFeet}<small style={{fontSize:18}}>ft</small></div><div className="lbl">Pledged so far</div></div>
          <div className="hero__stat"><div className="num">{stats.pct}<small style={{fontSize:18}}>%</small></div><div className="lbl">Of the way there</div></div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- ABOUT ------------------------------------ */
function About() {
  return (
    <section className="section about" id="about">
      <div className="wrap about__grid">
        <div>
          <p className="kicker">The Project</p>
          <h2 className="title">A proper way through the <span className="h-em">forest</span>.</h2>
          <p className="lede" style={{marginBottom: 30}}>
            The only access to Rideekanda Forest Monastery is an unpaved gravel track — severely uneven,
            rutted, and barely passable for ordinary vehicles. This project lays a durable concrete road
            so monastics, visitors, and meditators can reach this place of practice with ease and safety.
          </p>
          <div className="factsheet">
            <div className="fact"><div className="fact__k">Purpose</div><div className="fact__v">Reliable road access to the monastery for meditation practitioners and supply vehicles.</div></div>
            <div className="fact"><div className="fact__k">Full Length</div><div className="fact__v"><strong>1.9 km</strong> &nbsp;of forest track</div></div>
            <div className="fact"><div className="fact__k">Critical Phase</div><div className="fact__v"><strong>2,000 ft</strong> &nbsp;of concrete road repair — the steepest, most damaged stretch</div></div>
            <div className="fact"><div className="fact__k">Condition</div><div className="fact__v">Unpaved gravel, severe unevenness and off-road ruts — highly difficult for standard vehicles.</div></div>
            <div className="fact"><div className="fact__k">Location</div><div className="fact__v"><a href={PROJECT.mapUrl} target="_blank" rel="noopener">View the site on Google Maps ↗</a></div></div>
          </div>
        </div>
        <aside className="about__aside">
          <p style={{fontFamily:"var(--display)", fontSize:24, color:"var(--ink)", lineHeight:1.4, fontStyle:"italic"}}>
            “A road is not only a way for vehicles — it is a way for the Dhamma to reach those who seek it.”
          </p>
          <p>For years, the journey to Rideekanda has tested every visitor. In the monsoon, the gravel turns to
            mud; in the dry season, the ruts jar every wheel. Elderly practitioners and those carrying alms
            have struggled to make the climb.</p>
          <p>This concrete road — built to a verified 1:3:5 structural mix — will last for decades, carrying
            generations of practitioners quietly into the forest.</p>
          <div className="callout">
            <p className="kicker">The Critical 2,000 Feet</p>
            <h3>One foot of road, <span style={{fontStyle:"italic"}}>one act of generosity.</span></h3>
            <p>Each linear foot of finished concrete costs <strong style={{color:'#F4F0E5'}}>LKR&nbsp;2,706</strong>.
              Choose how many feet you wish to pave — your name marks that stretch of the road forever.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

/* ----------------------------- TECH SPECS ------------------------------- */
function Tech() {
  return (
    <section className="section tech" id="specs">
      <div className="wrap">
        <div className="center" style={{maxWidth:720, margin:"0 auto 8px"}}>
          <p className="kicker kicker--center">Engineering &amp; Cost</p>
          <h2 className="title">Built to a verified <span className="h-em">1:3:5 mix</span>.</h2>
          <p className="lede">Every rupee is grounded in a structural engineering estimate. The lean mix was revised to
            a stable 1:3:5 volumetric ratio for safe compressive tolerance under standard traffic loads.</p>
        </div>

        <div className="spec-cards" style={{marginTop:48}}>
          <div className="spec"><Ico d={ICONS.ruler} className="spec__ico"/><div className="spec__v">2,000<small> ft</small></div><div className="spec__k">Project scope — linear feet of concrete</div></div>
          <div className="spec"><Ico d={ICONS.width} className="spec__ico"/><div className="spec__v">8<small> ft</small> × 4<small> in</small></div><div className="spec__k">Cross-section — width × slab thickness</div></div>
          <div className="spec"><Ico d={ICONS.mix} className="spec__ico"/><div className="spec__v">1 : 3 : 5</div><div className="spec__k">Cement : sand : metal volumetric ratio</div></div>
          <div className="spec"><Ico d={ICONS.layers} className="spec__ico"/><div className="spec__v">880<small> bags</small></div><div className="spec__k">Cement allocation across the full 2,000 ft</div></div>
        </div>

        <div className="costtable">
          <div className="costtable__head">
            <div>Material / Element</div>
            <div className="num">Qty per ft</div>
            <div className="num">Unit rate</div>
            <div className="num">Cost / ft</div>
          </div>
          {COST_LINES.map((r,i)=>(
            <div className="costrow" key={i}>
              <div className="mat">{r.mat}<span>{r.sub}</span></div>
              <div className="num" data-l="Qty/ft">{r.qty}</div>
              <div className="num" data-l="Rate">{r.rate}</div>
              <div className="num" data-l="Cost/ft">{r.total}</div>
            </div>
          ))}
          <div className="costrow costrow--total">
            <div className="mat">Total per linear foot</div>
            <div className="num"></div>
            <div className="num"></div>
            <div className="num" data-l="Total">2,706.00</div>
          </div>
        </div>
        <p style={{textAlign:"center", fontSize:13.5, color:"var(--ink-faint)", marginTop:18}}>
          Master project budget for the full 2,000 ft scope: <strong style={{color:"var(--forest)"}}>LKR 5,412,000</strong> ·
          includes a standard engineering contingency buffer for the uneven terrain.
        </p>
      </div>
    </section>
  );
}

Object.assign(window, { React, useState, useEffect, useRef, useMemo, PROJECT, COST_LINES, fmt, LKR, Lotus, Ico, ICONS, Nav, Hero, About, Tech });
