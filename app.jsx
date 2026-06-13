/* global React, PROJECT, fmt, LKR, Lotus, Ico, ICONS, Nav, Hero, About, Tech */
const { useState, useEffect, useRef, useMemo } = window;

const LANES = 5;
const FT_PER_LANE = PROJECT.totalFeet / LANES; // 400
const STORE_KEY = "rideekanda_pledges_v1";

const SEED = [
  { id: "s1", name: "The Silva Family", message: "For our late mother.", feet: 60, donated: true },
  { id: "s2", name: "Anonymous", message: "", feet: 100, donated: true },
  { id: "s3", name: "Dhamma Friends, Colombo", message: "May all beings be at ease.", feet: 75, donated: true },
  { id: "s4", name: "Nimal & Kumari", message: "", feet: 40, donated: false },
  { id: "s5", name: "A. Fernando", message: "In gratitude.", feet: 25, donated: true },
  { id: "s6", name: "Meditation Group, Kandy", message: "", feet: 50, donated: false },
];

function loadPledges() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) { const p = JSON.parse(raw); if (Array.isArray(p)) return p; }
  } catch (e) {}
  return SEED.slice();
}

/* ===================== ROAD VISUAL (single bar) ===================== */
function Road({ pledges, pavedFeet, newId }) {
  const total = PROJECT.totalFeet;
  // Completed (black) first, then pledged (grey dotted), then blank remainder.
  const donated = pledges.filter((p) => p.donated);
  const pledged = pledges.filter((p) => !p.donated);
  const ordered = [...donated, ...pledged];
  let cursor = 0;
  const spans = ordered.map((p) => {
    const start = cursor; cursor += p.feet;
    return { ...p, start, end: cursor, mid: start + p.feet / 2 };
  });

  const [active, setActive] = useState(null);
  const [caret, setCaret] = useState(null);
  const trackRef = useRef(null);

  function locate(e) {
    const el = trackRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setCaret(x * 100);
    const ft = x * total;
    const hit = spans.find((s) => ft >= s.start && ft < s.end);
    setActive(hit ? hit.id : null);
  }
  function clear() { setActive(null); setCaret(null); }

  return (
    <div className="roadbox">
      <div className="rbar-stage" onPointerMove={locate} onPointerDown={locate} onPointerLeave={clear}>
        <div className="rbar">
          <div className="rbar-track" ref={trackRef}>
            {spans.map((s) => (
              <div key={s.id}
                className={"rseg " + (s.donated ? "rseg--done" : "rseg--pledged") + (active === s.id ? " is-active" : "") + (s.id === newId ? " rseg--new" : "")}
                style={{ left: (s.start / total) * 100 + "%", width: (s.feet / total) * 100 + "%" }} />
            ))}
            {caret != null && <div className="rcaret" style={{ left: caret + "%" }} />}
          </div>
          {(() => {
            const TIERS = [72, 40, 104]; // jagged tiers; cycled per side so neighbours never share a row
            let upN = 0, downN = 0;
            return spans.map((s, i) => {
              const isActive = active === s.id;
              const up = i % 2 === 0;
              const elev = TIERS[(up ? upN++ : downN++) % TIERS.length];
              const midPct = (s.mid / total) * 100;
              const rightAnchor = midPct > 68; // flip near right edge so the name stays inside the chart
              return (
                <div key={"p" + s.id}
                  className={"rptr " + (up ? "rptr--up" : "rptr--down") + (isActive ? " is-active" : "")}
                  style={{ left: midPct + "%", "--h": elev + "px" }}
                  onMouseEnter={() => setActive(s.id)} onMouseLeave={() => setActive(null)}>
                  <div className="rptr__dot" />
                  <div className="rptr__line" />
                  <div className={"rlabel" + (s.donated ? "" : " rlabel--pledged") + (rightAnchor ? " rlabel--ra" : "")}>
                    <span className="rlabel__ft">{s.feet}ft</span> {s.name}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
      <div className="ruler">
        {[0, 400, 800, 1200, 1600, 2000].map((m) => (<span key={m}>{m === 0 ? "0 ft" : m === 2000 ? "2,000 ft" : fmt(m)}</span>))}
      </div>
    </div>
  );
}

/* ===================== PLEDGE CARD ===================== */
function PledgeCard({ remaining, onPledge, onDonate, justPledged, onReset }) {
  const [name, setName] = useState("");
  const [feet, setFeet] = useState(10);
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");

  const ft = feet === "" ? 0 : feet;
  const cost = ft * PROJECT.costPerFoot;
  const quick = [1, 5, 10, 25, 50, 100];

  const clampFeet = (v) => Math.max(1, Math.min(remaining, v || 1));

  function submit() {
    if (!name.trim()) { setErr("Please add a name for the road marker."); return; }
    if (remaining <= 0) { setErr("The road is fully pledged — thank you!"); return; }
    setErr("");
    onPledge({ name: name.trim(), feet: clampFeet(feet), message: message.trim() });
    setName(""); setMessage(""); setFeet(10);
  }

  if (justPledged) {
    const done = justPledged.donated;
    return (
      <div className="pledge">
        <div style={{textAlign:"center", marginBottom: 6}}><Lotus className="" /></div>
        <h3 style={{textAlign:"center"}}>{done ? "Sādhu! Thank you." : "Your feet are reserved."}</h3>
        <p className="pledge__hint" style={{textAlign:"center"}}>
          {done
            ? <>Your gift of <b>{justPledged.feet} ft</b> is now part of the road. Your name marks it forever.</>
            : <>You’ve pledged <b>{justPledged.feet} linear feet</b>. Complete your donation to lay the concrete.</>}
        </p>
        <div className="pledge__cost">
          <span className="l">{done ? "Donated" : "Amount to donate"}</span>
          <span className="v"><LKR>{fmt(justPledged.feet * PROJECT.costPerFoot)}</LKR></span>
        </div>
        {!done && (
          <button className="btn btn--saffron btn--block" onClick={() => onDonate(justPledged.id)}>
            <Ico d={ICONS.heart} style={{width:18,height:18}} /> Donate {`LKR ${fmt(justPledged.feet * PROJECT.costPerFoot)}`}
          </button>
        )}
        <button className="btn btn--ghost btn--block" style={{marginTop:10}} onClick={onReset}>
          {done ? "Pledge more feet" : "Pledge another stretch"}
        </button>
        {!done && <p className="pledge__note">Your stretch is held on the road below. It stays open (unpaved) until your donation is complete.</p>}
      </div>
    );
  }

  return (
    <div className="pledge">
      <h3>Pave a stretch of road</h3>
      <p className="pledge__hint">Choose how many linear feet to pledge. Each foot is <b>LKR&nbsp;2,706</b> of finished concrete.</p>

      <div className="field">
        <label>Your name — as it appears on the road</label>
        <input className="input" value={name} placeholder="e.g. The Perera Family" onChange={(e)=>setName(e.target.value)} />
      </div>

      <div className="field">
        <label>Linear feet to pledge</label>
        <div className="feetfield">
          <input
            className="feetfield__input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={feet === "" ? "" : feet}
            placeholder="0"
            aria-label="Number of linear feet to pledge"
            onChange={(e) => {
              const digits = e.target.value.replace(/[^0-9]/g, "");
              if (digits === "") { setFeet(""); return; }
              setFeet(Math.min(remaining, parseInt(digits, 10)));
            }}
            onBlur={() => setFeet((f) => (f === "" || f < 1 ? 1 : f))}
          />
          <span className="feetfield__suffix">linear&nbsp;feet</span>
        </div>
        <div className="quickset">
          {quick.map(q=>(
            <button key={q} className={feet===q?"on":""} onClick={()=>setFeet(clampFeet(q))}>{q} ft</button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>A short dedication <span style={{textTransform:"none",letterSpacing:0,color:"var(--ink-faint)"}}>(optional)</span></label>
        <textarea className="input" value={message} placeholder="May all beings be well…" onChange={(e)=>setMessage(e.target.value)} />
      </div>

      {err && <p className="warn">{err}</p>}

      <div className="pledge__cost">
        <span className="l">{ft} ft × LKR 2,706</span>
        <span className="v"><LKR>{fmt(cost)}</LKR></span>
      </div>

      <button className="btn btn--primary btn--block" onClick={submit} disabled={remaining<=0}>
        {remaining<=0 ? "Road fully pledged 🙏" : <>Pledge these {ft} feet <Ico d={ICONS.arrow} style={{width:18,height:18}}/></>}
      </button>
      <p className="pledge__note">{remaining>0 ? `${fmt(remaining)} ft of road still open to pledge.` : "Every foot has found a donor."}</p>
    </div>
  );
}

/* ===================== PAVER SECTION ===================== */
function Paver({ pledges, pavedFeet, pct, remaining, onPledge, onDonate, justPledged, setJustPledged, newId }) {
  return (
    <section className="section paver" id="road">
      <div className="wrap">
        <div className="center" style={{maxWidth:720, margin:"0 auto"}}>
          <p className="kicker kicker--center">Pave the Road</p>
          <h2 className="title">Your name, set in <span className="h-em">concrete</span>.</h2>
          <p className="lede">Each pledge lays a real stretch of the 2,000-foot road. Watch it pave, foot by foot, as the
            community comes together. The rough gravel that remains is the work still to be done.</p>
        </div>

        <div className="roadmeta" style={{marginTop:44}}>
          <div>
            <div className="roadmeta__big"><b>{fmt(pavedFeet)}</b> of 2,000 ft paved</div>
            <div className="roadmeta__sub">{fmt(remaining)} feet of forest road still open · {pct}% complete</div>
          </div>
          <div className="roadmeta__legend">
            <span><i className="swatch swatch--done" /> Completed</span>
            <span><i className="swatch swatch--pledged" /> Pledged</span>
            <span><i className="swatch swatch--open" /> To be paved</span>
          </div>
        </div>

        <div className="paver__layout">
          <div>
            <Road pledges={pledges} pavedFeet={pavedFeet} newId={newId} />
            <Donors pledges={pledges} />
          </div>
          <PledgeCard
            remaining={remaining}
            onPledge={onPledge}
            onDonate={onDonate}
            justPledged={justPledged}
            onReset={() => setJustPledged(null)}
          />
        </div>
      </div>
    </section>
  );
}

function Donors({ pledges }) {
  const ordered = pledges.slice().reverse();
  return (
    <div className="donors">
      <div className="donors__head">
        <h4>Those who have given</h4>
        <span className="donors__count">{pledges.length} supporters</span>
      </div>
      <div className="donorgrid">
        {ordered.map((p) => (
          <div className="donorcard" key={p.id}>
            <div className="donorcard__ft">{p.feet}<small>feet</small></div>
            <div className="donorcard__nm">
              {p.name}
              {p.message && <div className="msg">“{p.message}”</div>}
            </div>
            <span className={"donorcard__badge " + (p.donated ? "badge--done" : "badge--pledged")}>{p.donated ? "Donated" : "Pledged"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===================== BUDGET ===================== */
function Budget({ pavedFeet, pledgedLKR, donatedLKR }) {
  const total = PROJECT.totalBudget;
  const donatedPct = (donatedLKR / total) * 100;
  const pledgedOnlyPct = ((pledgedLKR - donatedLKR) / total) * 100;
  const remaining = total - pledgedLKR;

  return (
    <section className="section budget" id="budget">
      <div className="wrap budget__grid">
        <div>
          <p className="kicker">Transparency</p>
          <h2 className="title">Every rupee, <span className="h-em">accounted for</span>.</h2>
          <p className="lede" style={{marginBottom: 30}}>
            This is a community offering. The budget below moves the moment a pledge is made — what has been
            donated, what has been pledged, and what is still needed to finish the road.
          </p>
          <div className="bigbar">
            <div className="bigbar__track">
              <div className="bigbar__done" style={{width: donatedPct + "%"}} />
              <div className="bigbar__pledged" style={{width: pledgedOnlyPct + "%"}} />
            </div>
            <div className="bigbar__labels">
              <span>{Math.round((pledgedLKR/total)*100)}% pledged</span>
              <span>Goal · <LKR>{fmt(total)}</LKR></span>
            </div>
          </div>
        </div>

        <div className="budrows">
          <div className="budrow budrow--total">
            <div className="budrow__l"><span className="budrow__chip" style={{background:"var(--paper-3)"}} />
              <div className="budrow__k">Total project budget<small>2,000 ft · full 1:3:5 concrete scope</small></div></div>
            <div className="budrow__v"><LKR>{fmt(total)}</LKR></div>
          </div>
          <div className="budrow">
            <div className="budrow__l"><span className="budrow__chip" style={{background:"var(--forest)"}} />
              <div className="budrow__k">Donated &amp; collected<small>concrete already funded</small></div></div>
            <div className="budrow__v"><LKR>{fmt(donatedLKR)}</LKR></div>
          </div>
          <div className="budrow">
            <div className="budrow__l"><span className="budrow__chip" style={{background:"var(--saffron)"}} />
              <div className="budrow__k">Pledged, awaiting donation<small>reserved feet not yet paid</small></div></div>
            <div className="budrow__v"><LKR>{fmt(pledgedLKR - donatedLKR)}</LKR></div>
          </div>
          <div className="budrow">
            <div className="budrow__l"><span className="budrow__chip" style={{background:"var(--paper-3)", boxShadow:"inset 0 0 0 1.5px var(--gravel)"}} />
              <div className="budrow__k">Still to be raised<small>{fmt(PROJECT.totalFeet - pavedFeet)} ft of road remaining</small></div></div>
            <div className="budrow__v"><LKR>{fmt(remaining)}</LKR></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================== CTA + FOOTER ===================== */
function CTA() {
  return (
    <section className="section cta">
      <div className="wrap center">
        <div className="cta__lotus"><Lotus /></div>
        <p className="kicker kicker--center">An Act of Generosity</p>
        <h2>Lay one foot of the path, <span style={{fontStyle:"italic"}}>and walk it forever.</span></h2>
        <p className="lede">Whether you pave a single foot or a hundred, every contribution carries practitioners
          quietly into the forest at Rideekanda. May your generosity bear fruit.</p>
        <div className="cta__cta">
          <a className="btn btn--saffron" href="#road">Pledge a linear foot <Ico d={ICONS.arrow} style={{width:18,height:18}}/></a>
          <a className="btn btn--ghost" href={PROJECT.mapUrl} target="_blank" rel="noopener" style={{color:"#ECE7D7", boxShadow:"inset 0 0 0 1.5px rgba(236,231,215,.3)"}}>Visit the site ↗</a>
        </div>
      </div>
    </section>
  );
}
function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <div className="footer__brand">
          <Lotus className="brand__mark" />
          <span className="brand__txt">
            <span className="brand__name" style={{fontFamily:"var(--display)",fontSize:18}}>Rideekanda Forest Monastery</span>
            <span className="brand__sub" style={{fontSize:10.5,letterSpacing:".18em",textTransform:"uppercase"}}>Road Construction Project</span>
          </span>
        </div>
        <small>A community Dhāna offering · 2,000 ft concrete road · LKR 2,706 per linear foot</small>
      </div>
    </footer>
  );
}

/* ===================== TOAST ===================== */
function Toast({ msg, show }) {
  return (
    <div className={"toast" + (show ? " show" : "")}>
      <Ico d={ICONS.check} style={{width:18,height:18}} /> {msg}
    </div>
  );
}

/* ===================== VERTICAL CARPET ROAD ===================== */
const ROLL_MS = 1300;
function VRoad({ pledges }) {
  const total = PROJECT.totalFeet;
  const donated = pledges.filter((p) => p.donated);
  const pledged = pledges.filter((p) => !p.donated);
  const ordered = [...donated, ...pledged];
  let cursor = 0;
  const spans = ordered.map((p) => {
    const start = cursor; cursor += p.feet;
    return { ...p, start, end: cursor, mid: start + p.feet / 2 };
  });
  const pavedFeet = cursor;
  const donatedFeet = donated.reduce((a, p) => a + p.feet, 0);
  const pledgedFeet = pledged.reduce((a, p) => a + p.feet, 0);
  const blankFeet = total - pavedFeet;

  const [active, setActive] = useState(null);
  const [caret, setCaret] = useState(null);
  const [rolling, setRolling] = useState(true);
  const stageRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setRolling(false), ROLL_MS + 80);
    return () => clearTimeout(t);
  }, []);

  function locate(e) {
    const el = stageRef.current; if (!el) return;
    const road = el.querySelector(".vroad-track");
    const rect = road.getBoundingClientRect();
    const fracFromBottom = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    setCaret(fracFromBottom * 100);
    const ft = fracFromBottom * total;
    const hit = spans.find((s) => ft >= s.start && ft < s.end);
    setActive(hit ? hit.id : null);
  }
  function clear() { setActive(null); setCaret(null); }
  function start(e) {
    const el = stageRef.current;
    if (el && el.setPointerCapture) { try { el.setPointerCapture(e.pointerId); } catch (_) {} }
    locate(e);
  }
  function leave(e) { if (!e || e.pointerType !== "touch") clear(); }

  return (
    <div className="vstage" ref={stageRef}
      onPointerDown={start} onPointerMove={locate}
      onPointerCancel={clear} onPointerLeave={leave}>
      <div className="vlegend">
        <span><i className="vleg--done" /> Completed <b>{fmt(donatedFeet)}{"\u00a0"}ft</b></span>
        <span><i className="vleg--pledged" /> Pledged <b>{fmt(pledgedFeet)}{"\u00a0"}ft</b></span>
        <span><i className="vleg--open" /> To be paved <b>{fmt(blankFeet)}{"\u00a0"}ft</b></span>
      </div>
      <div className={"vroad" + (rolling ? " vroad--rolling" : "")} style={{ "--roll-ms": ROLL_MS + "ms" }}>
        <span className="vcap vcap--bot">0 ft</span>
        <span className="vcap vcap--top">2,000 ft</span>
        <div className="vroad-track">
          <div className="vroad-surface">
            {spans.map((s) => (
              <div key={s.id}
                className={"vseg " + (s.donated ? "vseg--done" : "vseg--pledged") + (active === s.id ? " is-active" : "")}
                style={{ bottom: (s.start / total) * 100 + "%", height: (s.feet / total) * 100 + "%" }} />
            ))}
          </div>
        </div>
        {rolling && <div className="vroad-roll" />}
        {caret != null && (
          <React.Fragment>
            <div className="vcaret-glow" style={{ bottom: caret + "%" }} />
            <div className="vcaret" style={{ bottom: caret + "%" }} />
          </React.Fragment>
        )}

        {spans.map((s) => {
          const isActive = active === s.id;
          const delay = (s.mid / total) * ROLL_MS + 180;
          return (
            <div key={"l" + s.id}
              className={"vlabel" + (s.donated ? "" : " vlabel--pledged") + (isActive ? " is-active" : "")}
              style={{ bottom: (s.mid / total) * 100 + "%", transform: "translateY(50%)" + (isActive ? " scale(1.16)" : ""), animationDelay: delay + "ms" }}
              onMouseEnter={() => setActive(s.id)} onMouseLeave={() => setActive(null)}>
              <span><span className="vlabel__ft">{s.feet}ft</span> {s.name}</span>
              <span className="vlabel__dot" />
              <span className="vlabel__tick" style={{ top: "50%" }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== FLOATING PROGRESS BUTTON ===================== */
function ProgressFab({ pct, onClick }) {
  return (
    <button className="fab" onClick={onClick} aria-label="View road progress">
      <span className="fab__ring" style={{ "--p": pct }}>
        <span className="fab__pct">{pct}<small>%</small></span>
      </span>
      <span className="fab__txt">
        <b>Road progress</b>
        <span>Tap to see the road</span>
      </span>
    </button>
  );
}

/* ===================== PROGRESS MODAL ===================== */
function ProgressModal({ open, onClose, pledges, pct, pavedFeet, donatedFeet }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (!open) { setMounted(false); return; }
    const r = requestAnimationFrame(() => setMounted(true));
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(r); window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  if (!open) return null;
  const pledgedOnly = pavedFeet - donatedFeet;

  return (
    <div className={"pmodal" + (mounted ? " is-open" : "")} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pmodal__panel">
        <button className="pmodal__close" onClick={onClose} aria-label="Close">
          <Ico d="M6 6l12 12M18 6L6 18" style={{ width: 18, height: 18 }} />
        </button>
        <div className="pmodal__head">
          <p className="kicker kicker--center">The Road So Far</p>
          <h3>Watch the road <em>roll out</em></h3>
          <div className="pmodal__big"><b>{fmt(pavedFeet)}</b> of 2,000 ft underway · {pct}% complete</div>
        </div>
        <VRoad pledges={pledges} />
      </div>
    </div>
  );
}

/* ===================== APP ===================== */
function App() {
  const [pledges, setPledges] = useState(loadPledges);
  const [justPledged, setJustPledged] = useState(null);
  const [newId, setNewId] = useState(null);
  const [toast, setToast] = useState({ msg: "", show: false });
  const [progressOpen, setProgressOpen] = useState(false);
  const toastTimer = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(pledges)); } catch (e) {}
  }, [pledges]);

  function flash(msg) {
    setToast({ msg, show: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2800);
  }

  const pavedFeet = useMemo(() => pledges.reduce((s, p) => s + p.feet, 0), [pledges]);
  const donatedFeet = useMemo(() => pledges.filter(p=>p.donated).reduce((s,p)=>s+p.feet,0), [pledges]);
  const remaining = Math.max(0, PROJECT.totalFeet - pavedFeet);
  const pct = Math.round((pavedFeet / PROJECT.totalFeet) * 100);
  const pledgedLKR = pavedFeet * PROJECT.costPerFoot;
  const donatedLKR = donatedFeet * PROJECT.costPerFoot;

  function handlePledge({ name, feet, message }) {
    const id = "p" + Date.now();
    const p = { id, name, feet, message, donated: false };
    setPledges((list) => [...list, p]);
    setJustPledged(p);
    setNewId(id);
    flash(`${feet} ft reserved on the road — complete your donation below.`);
    setTimeout(() => { const el = document.getElementById("road"); if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: "smooth" }); }, 60);
  }

  function handleDonate(id) {
    setPledges((list) => list.map((p) => p.id === id ? { ...p, donated: true } : p));
    setJustPledged((jp) => jp && jp.id === id ? { ...jp, donated: true } : jp);
    flash("Sādhu! Your donation completes that stretch of road. 🙏");
  }

  return (
    <React.Fragment>
      <Nav />
      <Hero stats={{ pavedFeet: fmt(pavedFeet), pct }} />
      <About />
      <Tech />
      <Paver
        pledges={pledges} pavedFeet={pavedFeet} pct={pct} remaining={remaining}
        onPledge={handlePledge} onDonate={handleDonate}
        justPledged={justPledged} setJustPledged={setJustPledged} newId={newId}
      />
      <Budget pavedFeet={pavedFeet} pledgedLKR={pledgedLKR} donatedLKR={donatedLKR} />
      <CTA />
      <Footer />
      <Toast msg={toast.msg} show={toast.show} />
      <ProgressFab pct={pct} onClick={() => setProgressOpen(true)} />
      <ProgressModal
        open={progressOpen} onClose={() => setProgressOpen(false)}
        pledges={pledges} pct={pct} pavedFeet={pavedFeet} donatedFeet={donatedFeet}
      />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
