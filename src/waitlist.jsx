import React, { useState, useEffect, useRef } from "react";

/* ─── GOOGLE FONTS ─── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap');
    
    body {
      margin: 0;
      overflow-x: hidden;
      background: #f7f8fa; /* Light off-white to let the canvas blend nicely */
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    
    @keyframes fadeUp { 
      from { opacity: 0; transform: translateY(22px); } 
      to { opacity: 1; transform: translateY(0); } 
    }
    
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    /* Form Input Styles */
    .form-input {
      width: 100%;
      box-sizing: border-box;
      padding: 12px 16px;
      border-radius: 8px;
      border: 1.5px solid #d0dce8;
      background: #f7f8fa;
      font-size: 0.95rem;
      color: #0d1b2a;
      font-family: 'Plus Jakarta Sans', sans-serif;
      transition: all 0.2s ease;
      outline: none;
    }
    .form-input:focus {
      border-color: #1a7cc4;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(26, 124, 196, 0.1);
    }
    .form-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 700;
      color: #5a7491;
      margin-bottom: 6px;
      letter-spacing: 0.02em;
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
  off:       "#f7f8fa",
  border:    "#e4e9ef",
  border2:   "#d0dce8",
  text:      "#0d1b2a",
  muted:     "#5a7491",
  muted2:    "#8fa5bc",
  ink:       "#071220",
};

/* ══════════════════════════════════════════
   CUSTOM CURSOR (Kept from original)
══════════════════════════════════════════ */
function CustomCursor() {
  const dotRef        = useRef(null);
  const ringRef       = useRef(null);
  const trailCanvasRef= useRef(null);
  const posRef        = useRef({ x: -100, y: -100 });
  const ringPos       = useRef({ x: -100, y: -100 });
  const rafRef        = useRef(null);
  const isHoverRef    = useRef(false);
  const isClickRef    = useRef(false);
  const trailsRef     = useRef([]); 

  useEffect(() => {
    const tc  = trailCanvasRef.current;
    const tctx= tc.getContext("2d");

    const resize = () => {
      tc.width  = window.innerWidth;
      tc.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      trailsRef.current.push({ x: e.clientX, y: e.clientY, born: performance.now() });
      if (trailsRef.current.length > 24) trailsRef.current.shift();
    };
    const onOver = (e) => {
      if (e.target.closest("a,button,input,select,[data-hover]")) isHoverRef.current = true;
    };
    const onOut  = () => { isHoverRef.current = false; };
    const onDown = () => { isClickRef.current = true; };
    const onUp   = () => { isClickRef.current = false; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout",  onOut);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);

    const LIFE = 600;
    const COLORS = [C.green, C.blue, C.blueLight];

    const loop = () => {
      const now = performance.now();

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${posRef.current.x - 4}px,${posRef.current.y - 4}px)`;
      }

      if (ringRef.current) {
        ringPos.current.x += (posRef.current.x - ringPos.current.x) * 0.12;
        ringPos.current.y += (posRef.current.y - ringPos.current.y) * 0.12;
        const s = isHoverRef.current ? 2.2 : isClickRef.current ? 0.8 : 1;
        ringRef.current.style.transform = `translate(${ringPos.current.x - 20}px,${ringPos.current.y - 20}px) scale(${s})`;
        ringRef.current.style.borderColor = isHoverRef.current ? C.green : C.blue;
        ringRef.current.style.background  = isHoverRef.current ? `${C.green}22` : "transparent";
      }

      tctx.clearRect(0, 0, tc.width, tc.height);
      trailsRef.current = trailsRef.current.filter(p => now - p.born < LIFE);
      trailsRef.current.forEach((p, i) => {
        const age     = (now - p.born) / LIFE;
        const opacity = Math.max(0, (1 - age) * 0.55);
        const radius  = Math.max(0, (1 - age) * 4);
        tctx.beginPath();
        tctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        tctx.fillStyle = COLORS[i % 3];
        tctx.globalAlpha = opacity;
        tctx.fill();
        tctx.globalAlpha = 1;
      });

      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout",  onOut);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
    };
  }, []);

  return (
    <>
      <style>{`* { cursor: none !important; }`}</style>
      <canvas ref={trailCanvasRef} style={{ position:"fixed",top:0,left:0, width:"100vw",height:"100vh", pointerEvents:"none",zIndex:99997 }} />
      <div ref={dotRef} style={{ position:"fixed",top:0,left:0,width:8,height:8,background:C.green,borderRadius:"50%",pointerEvents:"none",zIndex:99999,boxShadow:`0 0 8px ${C.green},0 0 16px ${C.green}66`,willChange:"transform" }} />
      <div ref={ringRef} style={{ position:"fixed",top:0,left:0,width:40,height:40,border:`1.5px solid ${C.blue}`,borderRadius:"50%",pointerEvents:"none",zIndex:99998,transition:"border-color 0.25s,background 0.25s",mixBlendMode:"multiply",willChange:"transform" }} />
    </>
  );
}

/* ══════════════════════════════════════════
   INTERACTIVE BG CANVAS
══════════════════════════════════════════ */
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

    nodesRef.current = Array.from({ length: 55 }, () => ({
      x:     Math.random() * window.innerWidth,
      y:     Math.random() * window.innerHeight,
      vx:    (Math.random() - 0.5) * 0.35,
      vy:    (Math.random() - 0.5) * 0.35,
      r:     Math.random() * 2.5 + 1,
      alpha: Math.random() * 0.4 + 0.15,
    }));

    const onMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const nodes = nodesRef.current;
      const mouse = mouseRef.current;

      nodes.forEach(n => {
        const dx   = mouse.x - n.x;
        const dy   = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 220 && dist > 0) {
          n.vx += (dx / dist) * 0.018;
          n.vy += (dy / dist) * 0.018;
        }
        n.vx *= 0.97; n.vy *= 0.97;
        n.x  += n.vx;  n.y  += n.vy;
        if (n.x < 0) n.x = W; if (n.x > W) n.x = 0;
        if (n.y < 0) n.y = H; if (n.y > H) n.y = 0;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(3,62,102,${(1 - d / 130) * 0.15})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        const mdx  = n.x - mouse.x;
        const mdy  = n.y - mouse.y;
        const md   = Math.sqrt(mdx * mdx + mdy * mdy);
        const glow = md < 160 ? 1 + (1 - md / 160) * 2 : 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * glow, 0, Math.PI * 2);
        ctx.fillStyle = md < 160 ? `rgba(163,207,62,${n.alpha + 0.3})` : `rgba(3,62,102,${n.alpha})`;
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

  return <canvas ref={canvasRef} style={{ position:"fixed", top:0, left:0, width:"100vw", height:"100vh", pointerEvents:"none", zIndex:0 }} />;
}

/* ══════════════════════════════════════════
   REUSABLE BUTTON
══════════════════════════════════════════ */
function Btn({ children, variant = "primary", size = "sm", style: extraStyle = {}, onClick, type = "button" }) {
  const [hov, setHov] = useState(false);

  const pad = size === "xl" ? "16px 36px" : size === "lg" ? "14px 28px" : "12px 24px";
  const fs  = size === "xl" ? "1rem"      : size === "lg" ? "0.95rem"   : "0.875rem";

  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    borderRadius: 8, fontFamily: "'Plus Jakarta Sans',sans-serif",
    fontWeight: 700, cursor: "pointer", textDecoration: "none",
    transition: "all 0.18s", border: "none", whiteSpace: "nowrap",
    padding: pad, fontSize: fs,
  };

  const vMap = {
    primary: {
      background: hov ? C.blueMid : C.blue,
      color: "#fff",
      boxShadow: hov ? "0 8px 20px rgba(3,62,102,0.25)" : "0 1px 3px rgba(3,62,102,0.2)",
      transform: hov ? "translateY(-1px)" : "none",
    },
    green: {
      background: hov ? "#b8e047" : C.green,
      color: C.blue,
      boxShadow: hov ? "0 8px 20px rgba(163,207,62,0.3)" : "0 1px 3px rgba(163,207,62,0.2)",
      transform: hov ? "translateY(-1px)" : "none",
    }
  };

  return (
    <button
      type={type}
      style={{ ...base, ...vMap[variant], ...extraStyle }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════
   WAITLIST PAGE (MAIN EXPORT)
══════════════════════════════════════════ */
export default function WaitlistPage() {
  const [formState, setFormState] = useState({ name: "", email: "", reason: "student" });
  const [status, setStatus] = useState("idle"); // 'idle' | 'submitting' | 'success'

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("submitting");

    // Mock API call delay
    setTimeout(() => {
      setStatus("success");
    }, 1200);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <FontLoader />
      <CustomCursor />
      <InteractiveBg />

      {/* Simple Minimal Nav */}
      <nav style={{ position: "relative", zIndex: 10, padding: "24px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          {/* Logo using your image */}
          <img src="/logo.png" alt="Projex.pk" style={{ height: 38, objectFit: "contain" }} />
        </a>
      </nav>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 24px 80px", position: "relative", zIndex: 10 }}>
        
        {/* Card Container */}
        <div style={{ 
          background: "rgba(255, 255, 255, 0.95)", 
          backdropFilter: "blur(20px)",
          border: `1px solid ${C.border}`, 
          borderRadius: 20, 
          padding: "48px", 
          maxWidth: 480, 
          width: "100%",
          boxShadow: "0 24px 64px rgba(3,62,102,0.1)",
          animation: "scaleIn 0.5s ease both"
        }}>
          
          {status === "success" ? (
            /* SUCCESS STATE */
            <div style={{ textAlign: "center", animation: "fadeUp 0.4s ease both" }}>
              <div style={{ width: 64, height: 64, background: C.greenPale, border: `2px solid ${C.green}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", margin: "0 auto 24px", color: C.greenDark }}>
                ✓
              </div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: C.ink, marginBottom: 12, letterSpacing: "-0.02em" }}>
                You're on the list!
              </h2>
              <p style={{ color: C.muted, lineHeight: 1.6, fontSize: "0.95rem", marginBottom: 32 }}>
                Thank you for joining the Projex.pk waitlist. We’ll notify you as soon as early access opens.
              </p>
              <Btn variant="primary" style={{ width: "100%" }} onClick={() => setStatus("idle")}>
                Return to form
              </Btn>
            </div>
          ) : (
            /* WAITLIST FORM */
            <div style={{ animation: "fadeUp 0.4s ease both" }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:C.blueTint, border:`1px solid rgba(3,62,102,0.15)`, borderRadius:100, padding:"6px 14px", fontSize:"0.75rem", fontWeight:700, color:C.blue, marginBottom:24 }}>
                <span style={{ width: 8, height: 8, background: C.green, borderRadius: "50%" }} />
                BETA ACCESS
              </div>
              
              <h1 style={{ fontSize: "clamp(2rem, 3vw, 2.4rem)", fontWeight: 800, color: C.ink, lineHeight: 1.1, marginBottom: 12, letterSpacing: "-0.03em" }}>
                Join the <em style={{ fontFamily: "'Instrument Serif',serif", fontStyle: "italic", color: C.blue, fontWeight: 400 }}>Waitlist</em>
              </h1>
              
              <p style={{ color: C.muted, fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 32 }}>
                Be the first to experience Pakistan's secure network bridging final-year talent with industry leaders.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                
                <div>
                  <label htmlFor="name" className="form-label">Full Name</label>
                  <input 
                    id="name"
                    type="text" 
                    required 
                    placeholder="Ali Hassan"
                    className="form-input"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input 
                    id="email"
                    type="email" 
                    required 
                    placeholder="ali@university.edu.pk"
                    className="form-input"
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="reason" className="form-label">Why are you joining?</label>
                  <select 
                    id="reason"
                    className="form-input"
                    required
                    style={{ cursor: "pointer", appearance: "none" }}
                    value={formState.reason}
                    onChange={(e) => setFormState({ ...formState, reason: e.target.value })}
                  >
                    <option value="student">🎓 I'm a Student (To post projects)</option>
                    <option value="company">🏢 I'm a Company (To scout talent)</option>
                    <option value="university">🏛️ I represent a University</option>
                    <option value="other">💡 Other</option>
                  </select>
                </div>

                <div style={{ marginTop: 8 }}>
                  <Btn type="submit" variant="primary" style={{ width: "100%" }}>
                    {status === "submitting" ? "Securing your spot..." : "Get Early Access →"}
                  </Btn>
                </div>

              </form>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer style={{ padding: "24px", textAlign: "center", position: "relative", zIndex: 10, fontSize: "0.8rem", color: C.muted }}>
        © {new Date().getFullYear()} Projex.pk · Made in Pakistan 🇵🇰
      </footer>
    </div>
  );
}