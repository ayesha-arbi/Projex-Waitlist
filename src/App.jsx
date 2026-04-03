import { useState, useEffect, useRef } from "react";

import { 
  GraduationCap, 
  Building, 
  ShieldCheck, 
  MapPin, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  Loader2, 
  Lock
} from "lucide-react";

/* ─── GOOGLE FONTS & GLOBAL STYLES ─── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');
    @keyframes fadeUp { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
    @keyframes floatDot { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100%; overflow-x: hidden; background: #ffffff; color: #0d1b2a; }
    input, textarea, select, button { font-family: 'Plus Jakarta Sans', sans-serif; }
    input::placeholder, textarea::placeholder { color: #8fa5bc; }
    input:focus, textarea:focus { outline: none; }

    .layout-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      width: 100%;
    }
    .left-panel {
      padding: 56px 56px 56px 64px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .right-panel {
      padding: 56px 64px 56px 48px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    @media (max-width: 850px) {
      .layout-grid { grid-template-columns: 1fr; }
      .left-panel { padding: 40px 24px 32px; }
      .right-panel { padding: 0 24px 60px; }
    }
  `}</style>
);

/* ─── BRAND TOKENS ─── */
const C = {
  blue:      "#033e66",
  blueMid:   "#0a5a96",
  blueLight: "#1a7cc4",
  bluePale:  "#e8f3fb",
  blueTint:  "#f0f7fd",
  green:     "#a3cf3e",
  greenDark: "#7aaa1c",
  greenPale: "#f2f9e0",
  white:     "#ffffff",
  border:    "#e4e9ef",
  border2:   "#d0dce8",
  text:      "#0d1b2a",
  muted:     "#5a7491",
  muted2:    "#8fa5bc",
  ink:       "#071220",
};

/* ─── INTERACTIVE BG ─── */
function InteractiveBg() {
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: -1000, y: -1000 });
  const nodesRef  = useRef([]);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    let W = 0, H = 0;

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    nodesRef.current = Array.from({ length: 35 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      vx:    (Math.random() - 0.5) * 0.3,
      vy:    (Math.random() - 0.5) * 0.3,
      r:     Math.random() * 2 + 1,
      alpha: Math.random() * 0.35 + 0.1,
    }));

    const onMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const nodes = nodesRef.current;
      const mouse = mouseRef.current;

      nodes.forEach(n => {
        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 200 && dist > 0) { n.vx += (dx/dist)*0.015; n.vy += (dy/dist)*0.015; }
        n.vx *= 0.97; n.vy *= 0.97;
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
        if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i+1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(3,62,102,${(1-d/120)*0.12})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
        const mdx = nodes[i].x - mouse.x, mdy = nodes[i].y - mouse.y;
        const md = Math.sqrt(mdx*mdx + mdy*mdy);
        if (md < 160) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(163,207,62,${(1-md/160)*0.25})`;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }

      nodes.forEach(n => {
        const mdx = n.x - mouse.x, mdy = n.y - mouse.y;
        const md = Math.sqrt(mdx*mdx + mdy*mdy);
        const glow = md < 150 ? 1 + (1-md/150)*2.5 : 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r*glow, 0, Math.PI*2);
        ctx.fillStyle = md < 150 ? `rgba(163,207,62,${n.alpha+0.3})` : `rgba(3,62,102,${n.alpha})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position:"fixed", top:0, left:0,
      width:"100vw", height:"100vh",
      pointerEvents:"none", zIndex:0,
    }} />
  );
}

/* ─── NAV — fixed, full viewport width, no side gaps ─── */
function Nav({ currentCount }) {
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:900,
      height:64,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"0 48px",
      background:"rgba(255,255,255,0.96)",
      backdropFilter:"blur(14px)",
      borderBottom:`1px solid ${C.border}`,
      boxShadow:"0 2px 16px rgba(3,62,102,0.07)",
    }}>
      <a href="#" style={{ display:"flex", alignItems:"center", textDecoration:"none" }}>
        <img src="/logo.png" alt="Projex.pk" style={{ height:150, width:"auto", objectFit:"contain" }} />
      </a>
      <div style={{
        display:"flex", alignItems:"center", gap:8,
        background:C.greenPale, border:`1px solid rgba(163,207,62,0.3)`,
        borderRadius:100, padding:"6px 16px",
        fontSize:"0.78rem", fontWeight:700, color:C.greenDark,
      }}>
        <span style={{ width:7, height:7, borderRadius:"50%", background:C.green, display:"inline-block", animation:"pulse 2s ease infinite" }} />
        {currentCount.toLocaleString()}+ on waitlist
      </div>
    </nav>
  );
}

/* ─── STAT PILL ─── */
function StatPill({ icon, label }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:8,
      background:C.white, border:`1px solid ${C.border2}`,
      borderRadius:100, padding:"8px 16px",
      fontSize:"0.8rem", fontWeight:600, color:C.muted,
      boxShadow:"0 1px 4px rgba(3,62,102,0.05)",
    }}>
      <span style={{ color:C.blueLight, display:"flex", alignItems:"center" }}>{icon}</span>
      {label}
    </div>
  );
}

/* ─── FORM FIELD ─── */
function Field({ label, hint, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <label style={{ fontSize:"0.82rem", fontWeight:700, color:C.text }}>{label}</label>
        {hint && <span style={{ fontSize:"0.73rem", color:C.muted2, fontWeight:500 }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputBase = {
  width:"100%", padding:"12px 14px",
  border:`1.5px solid ${C.border2}`, borderRadius:9,
  fontSize:"0.875rem", color:C.text,
  background:C.white, transition:"all 0.2s ease",
};

/* ─── MAIN WAITLIST PAGE ─── */
export default function WaitlistPage() {
  const [role, setRole] = useState(null);
  const [form, setForm] = useState({ name:"", email:"", reason:"" });
  const [errors, setErrors] = useState({});
  const [focusField, setFocus] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waitlistCount, setWaitlistCount] = useState(248);

  useEffect(() => {
    const t = setInterval(() => {
      if (Math.random() > 0.6) setWaitlistCount(c => c + Math.floor(Math.random() * 3) + 1);
    }, 6500);
    return () => clearInterval(t);
  }, []);

  const validate = () => {
    const e = {};
    if (!role) e.role = "Required";
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (!form.reason.trim() || form.reason.trim().length < 20) e.reason = "Min 20 characters";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); setWaitlistCount(c => c+1); }, 1500);
  };

  const inputStyle = (f) => ({
    ...inputBase,
    borderColor: errors[f] ? "#ef4444" : focusField===f ? C.blueLight : C.border2,
    boxShadow: focusField===f ? `0 0 0 3px ${C.bluePale}` : "none",
  });

  if (submitted) return <SuccessScreen name={form.name} role={role} currentCount={waitlistCount} />;

  return (
    <div style={{ minHeight:"100vh", position:"relative", background:C.white }}>
      <FontLoader />
      <InteractiveBg />
      <Nav currentCount={waitlistCount} />

      {/* Page body — starts below fixed nav, no wrapper that creates side borders */}
      <div style={{ position:"relative", zIndex:1, paddingTop:64, background:C.white }}>
        <div className="layout-grid">

          {/* ── LEFT PANEL ── */}
          <div className="left-panel">
            <div style={{
              display:"inline-flex", alignItems:"center", gap:8,
              background:C.blueTint, border:`1px solid rgba(3,62,102,0.1)`,
              borderRadius:100, padding:"5px 14px 5px 8px",
              fontSize:"0.73rem", fontWeight:700, color:C.blue,
              marginBottom:24, width:"fit-content",
              animation:"fadeUp 0.5s ease both",
            }}>
              <span style={{ background:C.green, color:C.blue, fontSize:"0.63rem", fontWeight:800, padding:"2px 9px", borderRadius:100 }}>BETA</span>
              Early access · Karachi &amp; Sindh
            </div>

            <h1 style={{
              fontSize:"clamp(2.2rem,3.4vw,3.6rem)", fontWeight:800,
              letterSpacing:"-0.032em", lineHeight:1.07, color:C.ink,
              marginBottom:16,
              animation:"fadeUp 0.55s 0.07s ease both",
            }}>
              Be first when<br />
              <span style={{ position:"relative", display:"inline-block" }}>
                <em style={{ fontFamily:"'Instrument Serif',serif", fontStyle:"italic", color:C.blue }}>Pakistan connects</em>
                <span style={{
                  position:"absolute", bottom:6, left:0, right:0,
                  height:7, background:C.green, borderRadius:3,
                  opacity:0.4, zIndex:-1,
                }} />
              </span>
              <br />campus to company.
            </h1>

            <p style={{
              fontSize:"0.95rem", color:C.muted, lineHeight:1.72,
              maxWidth:440, marginBottom:28,
              animation:"fadeUp 0.55s 0.14s ease both",
            }}>
              Projex.pk is building Pakistan's first consent-first marketplace where final-year projects meet real industry demand. Join the waitlist and help us shape it.
            </p>

            <div style={{
              display:"flex", gap:10, flexWrap:"wrap", marginBottom:32,
              animation:"fadeUp 0.55s 0.21s ease both",
            }}>
              <StatPill icon={<GraduationCap size={16} strokeWidth={2.5}/>} label="NED · FAST · IBA · KU" />
              <StatPill icon={<ShieldCheck size={16} strokeWidth={2.5}/>} label="IP-protected" />
              <StatPill icon={<MapPin size={16} strokeWidth={2.5}/>} label="Built for Pakistan" />
            </div>

            {/* Social proof */}
            <div style={{
              display:"flex", alignItems:"center", gap:14, marginBottom:32,
              animation:"fadeUp 0.55s 0.28s ease both",
            }}>
              <div style={{ display:"flex" }}>
                {[["AH",C.blue],["ZM",C.blueMid],["SF",C.greenDark],["RK",C.blueLight],["MK","#5a7491"]].map(([init,bg],i) => (
                  <div key={i} style={{
                    width:32, height:32, borderRadius:"50%", background:bg,
                    border:"2px solid #fff", marginLeft:i===0?0:-9,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"0.67rem", fontWeight:800, color:"#fff",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.1)",
                  }}>{init}</div>
                ))}
              </div>
              <div>
                <div style={{ fontSize:"0.87rem", fontWeight:700, color:C.text }}>{waitlistCount.toLocaleString()}+ people</div>
                <div style={{ fontSize:"0.8rem", color:C.muted }}>already waiting</div>
              </div>
            </div>

            {/* Feature list */}
            <div style={{
              borderTop:`1px solid ${C.border}`, paddingTop:28,
              display:"flex", flexDirection:"column", gap:12,
              animation:"fadeUp 0.55s 0.35s ease both", maxWidth:440,
            }}>
              {[
                [<Lock size={15}/>, "Your IP is always protected — companies need approval first"],
                [<FileText size={15}/>, "NDA templates and verified company profiles included"],
                [<CheckCircle size={15}/>, "Free forever for students · Structured plans for companies"],
              ].map(([icon,text], i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, fontSize:"0.85rem", color:C.muted, lineHeight:1.4 }}>
                  <span style={{
                    width:28, height:28, borderRadius:7,
                    background:C.blueTint, border:`1px solid rgba(3,62,102,0.1)`,
                    color:C.blueLight,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    flexShrink:0,
                  }}>{icon}</span>
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT PANEL — FORM ── */}
          <div className="right-panel">
            <div style={{
              background:C.white,
              border:`1px solid ${C.border}`,
              borderRadius:20,
              boxShadow:"0 8px 28px rgba(3,62,102,0.08), 0 2px 8px rgba(3,62,102,0.04)",
              padding:"36px 32px",
              position:"relative", overflow:"hidden",
              maxWidth:500, width:"100%", margin:"0 auto",
            }}>
              {/* Top gradient accent */}
              <div style={{
                position:"absolute", top:0, left:0, right:0, height:3,
                background:`linear-gradient(90deg, ${C.blue}, ${C.blueLight}, ${C.green})`,
              }} />

              <div style={{ marginBottom:24 }}>
                <h2 style={{ fontSize:"1.45rem", fontWeight:800, color:C.ink, letterSpacing:"-0.02em", marginBottom:6 }}>
                  Join the Waitlist
                </h2>
                <p style={{ fontSize:"0.85rem", color:C.muted, lineHeight:1.6 }}>
                  Get early access &amp; help us shape what we build next.
                </p>
              </div>

              {/* Role selector */}
              <div style={{ marginBottom:22 }}>
                <label style={{ fontSize:"0.82rem", fontWeight:700, color:C.text, display:"flex", justifyContent:"space-between", marginBottom:9 }}>
                  I am a —
                  {errors.role && <span style={{ color:"#ef4444", fontWeight:600 }}>{errors.role}</span>}
                </label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                  {[
                    ["student", <GraduationCap size={17} key="s"/>, "Student / Graduate"],
                    ["company", <Building size={17} key="c"/>, "Company / Recruiter"]
                  ].map(([val,icon,label]) => (
                    <button
                      key={val}
                      onClick={() => { setRole(val); setErrors(e => ({...e, role:undefined})); }}
                      style={{
                        padding:"12px 14px",
                        border:`1.5px solid ${role===val ? C.blue : errors.role ? "#fca5a5" : C.border2}`,
                        borderRadius:10,
                        background: role===val ? C.blue : C.white,
                        color: role===val ? "#fff" : C.muted,
                        fontSize:"0.82rem", fontWeight:700,
                        cursor:"pointer", transition:"all 0.18s ease",
                        display:"flex", alignItems:"center", gap:9,
                        boxShadow: role===val ? "0 3px 10px rgba(3,62,102,0.18)" : "none",
                      }}
                    >
                      {icon} {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:24 }}>
                <Field label="Full Name" hint={errors.name}>
                  <input
                    type="text"
                    placeholder={role==="company" ? "e.g. Sana Qureshi, Hiring Manager" : "e.g. Ahmed Hassan"}
                    value={form.name}
                    onChange={e => { setForm(f=>({...f,name:e.target.value})); setErrors(er=>({...er,name:undefined})); }}
                    onFocus={() => setFocus("name")}
                    onBlur={() => setFocus(null)}
                    style={{ ...inputStyle("name"), color: errors.name ? "#ef4444" : C.text }}
                  />
                </Field>

                <Field label="Email Address" hint={errors.email}>
                  <input
                    type="email"
                    placeholder={role==="student" ? "preferably your .edu.pk email" : "your work email"}
                    value={form.email}
                    onChange={e => { setForm(f=>({...f,email:e.target.value})); setErrors(er=>({...er,email:undefined})); }}
                    onFocus={() => setFocus("email")}
                    onBlur={() => setFocus(null)}
                    style={{ ...inputStyle("email"), color: errors.email ? "#ef4444" : C.text }}
                  />
                </Field>

                <Field label="Why are you joining?" hint={errors.reason || `${form.reason.length}/200`}>
                  <textarea
                    rows={4}
                    placeholder={
                      role==="company"
                        ? "e.g. We're looking to scout IoT and AI prototypes from local universities..."
                        : "e.g. I built an ML system for my FYP and want to connect with real companies..."
                    }
                    value={form.reason}
                    maxLength={200}
                    onChange={e => { setForm(f=>({...f,reason:e.target.value})); setErrors(er=>({...er,reason:undefined})); }}
                    onFocus={() => setFocus("reason")}
                    onBlur={() => setFocus(null)}
                    style={{
                      ...inputStyle("reason"),
                      resize:"vertical", minHeight:96, lineHeight:1.6,
                      color: errors.reason ? "#ef4444" : C.text,
                    }}
                  />
                </Field>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width:"100%", padding:"14px 24px",
                  background: loading ? C.blueMid : C.blue,
                  color:"#fff", border:"none", borderRadius:10,
                  fontSize:"0.92rem", fontWeight:800,
                  cursor: loading ? "not-allowed" : "pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                  boxShadow: loading ? "none" : "0 6px 18px rgba(3,62,102,0.22)",
                  transition:"all 0.2s ease",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C.blueMid; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = C.blue; }}
              >
                {loading ? (
                  <><Loader2 size={19} style={{ animation:"spin 1s linear infinite" }}/> Securing your spot...</>
                ) : (
                  <>{role==="company" ? <Building size={18}/> : <GraduationCap size={18}/>} Join the Waitlist <ArrowRight size={17}/></>
                )}
              </button>

              <p style={{ textAlign:"center", fontSize:"0.76rem", color:C.muted2, marginTop:16 }}>
                No spam. No sharing. We'll only reach out when early access opens.
              </p>
            </div>

            {/* Trust badges */}
            <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:18, flexWrap:"wrap" }}>
              {["Consent-First Model","Karachi · Sindh · Pakistan","Free for Students"].map(t => (
                <span key={t} style={{
                  fontSize:"0.73rem", color:C.muted, fontWeight:600,
                  background:C.white, border:`1px solid ${C.border}`,
                  borderRadius:100, padding:"5px 12px",
                  display:"flex", alignItems:"center", gap:5,
                }}>
                  <CheckCircle size={11} color={C.greenDark}/> {t}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── SUCCESS SCREEN ─── */
function SuccessScreen({ name, role, currentCount }) {
  const firstName = name.split(" ")[0];

  return (
    <div style={{
      minHeight:"100vh", position:"relative", background:C.white,
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      textAlign:"center", padding:"48px 24px",
    }}>
      <FontLoader />
      <InteractiveBg />
      <Nav currentCount={currentCount} />

      <div style={{ position:"relative", zIndex:1, maxWidth:560, width:"100%" }}>

        {/* Floating dots decoration */}
        <div style={{ position:"relative", height:48, marginBottom:12 }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{
              position:"absolute",
              top:`${20+Math.sin(i*60*Math.PI/180)*40}%`,
              left:`${50+Math.cos(i*60*Math.PI/180)*40}%`,
              width:i%2===0?10:7, height:i%2===0?10:7,
              borderRadius:"50%",
              background:i%2===0?C.green:C.blueLight,
              animation:`floatDot ${1.5+i*0.2}s ease-in-out infinite`,
            }} />
          ))}
        </div>

        <div style={{ animation:"fadeUp 0.5s ease both" }}>
          <div style={{
            display:"inline-flex", alignItems:"center", gap:8,
            background:C.greenPale, border:`1px solid rgba(163,207,62,0.4)`,
            borderRadius:100, padding:"6px 16px",
            fontSize:"0.78rem", fontWeight:800, color:C.greenDark,
            marginBottom:20,
          }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:C.green, display:"inline-block" }} />
            Spot #{currentCount.toLocaleString()} secured
          </div>

          <h1 style={{
            fontSize:"clamp(2.2rem,4vw,3.2rem)", fontWeight:800,
            letterSpacing:"-0.03em", color:C.ink, lineHeight:1.1, marginBottom:16,
          }}>
            You're in, {firstName}! 🇵🇰
          </h1>
          <p style={{ fontSize:"1rem", color:C.muted, lineHeight:1.75, marginBottom:36, maxWidth:480, marginInline:"auto" }}>
            We've added you to the waitlist as a{" "}
            <strong style={{ color:C.blue }}>{role==="company" ? "Company / Recruiter" : "Student / Graduate"}</strong>.
            We'll reach out as soon as early access opens in Karachi &amp; Sindh.
          </p>
        </div>

        {/* What's next — "Confirmation email" step removed, only 2 steps */}
        <div style={{
          background:C.white, border:`1px solid ${C.border}`,
          borderRadius:18, padding:"32px 36px", textAlign:"left",
          boxShadow:"0 8px 28px rgba(3,62,102,0.07)",
          animation:"fadeUp 0.55s 0.1s ease both",
          position:"relative", overflow:"hidden",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg, ${C.blue}, ${C.green})` }} />
          <h3 style={{ fontSize:"0.95rem", fontWeight:800, color:C.text, marginBottom:20 }}>
            What happens next
          </h3>
          {[
            ["01","Early access invite","You'll be among the first to get access when we open our beta doors."],
            ["02","Shape the platform","Beta users get direct input on features — your feedback matters to us."],
          ].map(([n,h,p]) => (
            <div key={n} style={{ display:"flex", gap:14, marginBottom:16 }}>
              <div style={{
                width:34, height:34, borderRadius:9, flexShrink:0,
                background:C.blueTint, border:`1px solid rgba(3,62,102,0.1)`,
                color:C.blue, display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:"0.8rem", fontWeight:800,
              }}>{n}</div>
              <div>
                <div style={{ fontSize:"0.9rem", fontWeight:700, color:C.text, marginBottom:3 }}>{h}</div>
                <div style={{ fontSize:"0.82rem", color:C.muted, lineHeight:1.6 }}>{p}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}