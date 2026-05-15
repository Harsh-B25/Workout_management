import { useState, useEffect } from "react";

// ─── DESIGN TOKENS (matches RepBase.jsx exactly) ──────────────────────────────
const C = {
  bg:          "#0d0f10",
  surface:     "#141618",
  card:        "#1a1d1f",
  cardHover:   "#1f2224",
  border:      "#252829",
  borderMid:   "#2e3235",
  borderFocus: "#1e9bcc",
  accent:      "#1e9bcc",
  accentBright:"#2db8ef",
  accentDim:   "rgba(30,155,204,0.12)",
  red:         "#ef5350",
  redDim:      "rgba(239,83,80,0.12)",
  green:       "#66bb6a",
  greenDim:    "rgba(102,187,106,0.12)",
  amber:       "#ffa726",
  amberDim:    "rgba(255,167,38,0.12)",
  text:        "#f0f2f4",
  textSub:     "#8a9099",
  textDim:     "#4a5058",
};
const SANS = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const BODY = "'Inria Sans', Georgia, serif";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
// Resolves colour per access level — shared with ManageMemberships
function accessMeta(level = "") {
  if (level.includes("Full") || level.includes("Premium+"))
    return { color: "#ab47bc", dim: "rgba(171,71,188,0.12)", border: "rgba(171,71,188,0.3)" };
  if (level.includes("Cardio") || level.includes("Standard") || level.includes("Pro"))
    return { color: C.accentBright, dim: C.accentDim, border: "rgba(30,155,204,0.3)" };
  if (level.includes("Basic") || level.includes("Gym Access"))
    return { color: C.green, dim: C.greenDim, border: "rgba(102,187,106,0.3)" };
  return { color: C.amber, dim: C.amberDim, border: "rgba(255,167,38,0.3)" };
}

// Compute expiry date string from a duration string like "1 Month", "3 Months" etc.
function computeExpiry(durationStr = "") {
  const today = new Date();
  const lower  = durationStr.toLowerCase();
  let months = 0, days = 0;
  if (lower.includes("annual") || lower.includes("12 month")) months = 12;
  else if (lower.includes("semi") || lower.includes("6 month")) months = 6;
  else if (lower.includes("quarter") || lower.includes("3 month")) months = 3;
  else if (lower.includes("2 month")) months = 2;
  else if (lower.includes("month")) months = 1;
  else {
    const n = parseInt(lower);
    if (!isNaN(n)) days = n;
  }
  const expiry = new Date(today);
  if (months) expiry.setMonth(expiry.getMonth() + months);
  else expiry.setDate(expiry.getDate() + days);
  return expiry.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

// ─── MEMBERSHIP SELECT MODAL ──────────────────────────────────────────────────
// Props:
//   plan     – { name, duration, price, access, popular } from MembershipPage
//              OR { plan_name, duration, price, access_level } from ManageMemberships
//   onConfirm – (plan) => void   called when member confirms
//   onCancel  – () => void
//
// The component normalises both plan shapes so it works from both callers.

export default function MembershipSelectModal({ plan, onConfirm, onCancel }) {
  const [confirming, setConfirming] = useState(false);
  const [done,       setDone]       = useState(false);

  // Normalise field names — works with RepBase MembershipPage AND ManageMemberships
  const p = {
    name:     plan.plan_name  || plan.name     || "Plan",
    duration: typeof plan.duration === "number"
                ? (() => {
                    const d = plan.duration;
                    if (d >= 365) return "1 Year";
                    if (d >= 180) return "6 Months";
                    if (d >= 90)  return "3 Months";
                    if (d >= 60)  return "2 Months";
                    if (d >= 30)  return "1 Month";
                    return `${d} Days`;
                  })()
                : (plan.duration || "—"),
    price:    plan.price
                ? (typeof plan.price === "number"
                    ? `₹${plan.price.toLocaleString("en-IN")}`
                    : plan.price)
                : "—",
    access:   plan.access_level || plan.access || "—",
    popular:  plan.popular || false,
  };

  const am        = accessMeta(p.access);
  const expiry    = computeExpiry(p.duration);
  const startDate = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape" && !confirming) onCancel(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming, onCancel]);

  function handleConfirm() {
    if (confirming || done) return;
    setConfirming(true);
    setTimeout(() => {
      setDone(true);
      setTimeout(() => onConfirm(plan), 700);
    }, 500);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inria+Sans:wght@300;400;700&family=Inter:wght@400;500;600;700&display=swap');

        @keyframes msm-backdrop {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes msm-slide {
          from { opacity: 0; transform: translateY(22px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes msm-check {
          0%   { transform: scale(0.4); opacity: 0; }
          60%  { transform: scale(1.25); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes msm-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes msm-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .msm-backdrop { animation: msm-backdrop 0.2s ease both; }
        .msm-card     { animation: msm-slide 0.32s cubic-bezier(0.22,1,0.36,1) both; }
        .msm-check    { animation: msm-check  0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .msm-spin     { animation: msm-spin   0.7s linear infinite; }
      `}</style>

      {/* ── Backdrop ── */}
      <div
        className="msm-backdrop"
        onClick={e => { if (e.target === e.currentTarget && !confirming) onCancel(); }}
        style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.76)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }}
      >
        {/* ── Modal card ── */}
        <div className="msm-card" style={{
          width: "100%", maxWidth: 420,
          background: C.surface,
          border: `1px solid ${C.borderMid}`,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: "0 28px 72px rgba(0,0,0,0.65)",
        }}>

          {/* Colour accent strip — matches access level */}
          <div style={{
            height: 3,
            background: `linear-gradient(90deg, ${am.color}, ${am.color}55)`,
          }} />

          <div style={{ padding: "26px 26px 24px" }}>

            {/* ── Header ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
              <div>
                <div style={{ fontFamily: SANS, fontSize: 13, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5 }}>
                  Membership Plan
                </div>
                <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>
                  {p.name}
                </div>
              </div>
              {!confirming && (
                <button
                  onClick={onCancel}
                  style={{ background: "none", border: "none", color: C.textSub, cursor: "pointer", fontSize: 22, lineHeight: 1, padding: 0, marginTop: 2 }}
                >×</button>
              )}
            </div>

            {/* ── Price hero ── */}
            <div style={{
              background: C.card,
              border: `1px solid ${p.popular ? C.accent + "50" : C.border}`,
              borderRadius: 14,
              padding: "20px 22px",
              marginBottom: 16,
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Subtle tinted corner glow */}
              <div style={{
                position: "absolute", top: -30, right: -30,
                width: 100, height: 100, borderRadius: "50%",
                background: `${am.color}18`,
                pointerEvents: "none",
              }} />

              {p.popular && (
                <div style={{
                  display: "inline-block",
                  background: C.accent, color: "#fff",
                  borderRadius: 20, padding: "3px 12px",
                  fontFamily: SANS, fontSize: 10, fontWeight: 700,
                  letterSpacing: "0.05em", marginBottom: 12,
                }}>MOST POPULAR</div>
              )}

              {/* Price */}
              <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginBottom: 6 }}>
                <span style={{ fontFamily: SANS, fontSize: 13, color: C.textSub }}>₹</span>
                <span style={{ fontFamily: SANS, fontSize: 36, fontWeight: 700, color: am.color, lineHeight: 1 }}>
                  {p.price.replace("₹", "").replace(/,/g, "")}
                </span>
              </div>
              <div style={{ fontFamily: BODY, fontSize: 13, color: C.textSub, fontWeight: 300 }}>
                for {p.duration}
              </div>
            </div>

            {/* ── Plan detail rows ── */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 16 }}>
              {[
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1.8" strokeLinecap="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  ),
                  label: "Access Level",
                  value: (
                    <span style={{
                      display: "inline-block",
                      background: am.dim, color: am.color,
                      border: `1px solid ${am.border}`,
                      borderRadius: 20, padding: "2px 11px",
                      fontFamily: SANS, fontSize: 11, fontWeight: 600,
                    }}>{p.access}</span>
                  ),
                },
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1.8" strokeLinecap="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  ),
                  label: "Duration",
                  value: <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.text }}>{p.duration}</span>,
                },
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1.8" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  ),
                  label: "Start date",
                  value: <span style={{ fontFamily: BODY, fontSize: 13, color: C.textSub, fontWeight: 300 }}>{startDate}</span>,
                },
                {
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1.8" strokeLinecap="round">
                      <path d="M18.36 6.64A9 9 0 1 1 5.64 6.64"/>
                      <line x1="12" y1="2" x2="12" y2="12"/>
                    </svg>
                  ),
                  label: "Expires on",
                  value: <span style={{ fontFamily: BODY, fontSize: 13, color: C.textSub, fontWeight: 300 }}>{expiry}</span>,
                },
              ].map((row, i, arr) => (
                <div key={row.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 16px",
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {row.icon}
                    <span style={{ fontFamily: SANS, fontSize: 12, color: C.textSub }}>{row.label}</span>
                  </div>
                  {row.value}
                </div>
              ))}
            </div>

            {/* ── Info note ── */}
            <div style={{
              display: "flex", gap: 9, alignItems: "flex-start",
              background: C.accentDim, border: "1px solid rgba(30,155,204,0.2)",
              borderRadius: 10, padding: "11px 14px", marginBottom: 20,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accentBright} strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
              </svg>
              <p style={{ fontFamily: BODY, fontSize: 12, color: C.textSub, lineHeight: 1.6, margin: 0, fontWeight: 300 }}>
                Your current membership will be replaced once this plan is activated. Payment will be processed at the gym counter or through the registered payment method.
              </p>
            </div>

            {/* ── Action buttons ── */}
            <div style={{ display: "flex", gap: 10 }}>
              {/* Cancel */}
              {!confirming && (
                <button
                  onClick={onCancel}
                  style={{
                    flex: 1,
                    background: "none",
                    border: `1px solid ${C.border}`,
                    borderRadius: 10, padding: "12px",
                    color: C.textSub,
                    fontFamily: SANS, fontSize: 13, fontWeight: 500,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderMid; e.currentTarget.style.color = C.text; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border;    e.currentTarget.style.color = C.textSub; }}
                >
                  Cancel
                </button>
              )}

              {/* Confirm */}
              <button
                onClick={handleConfirm}
                disabled={confirming}
                style={{
                  flex: confirming ? "1 1 100%" : 2,
                  background: done ? C.green : C.accent,
                  border: "none",
                  borderRadius: 10, padding: "12px",
                  color: "#fff",
                  fontFamily: SANS, fontSize: 13, fontWeight: 600,
                  cursor: confirming ? "default" : "pointer",
                  transition: "background 0.2s, flex 0.25s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
                onMouseEnter={e => { if (!confirming) e.currentTarget.style.background = done ? C.green : C.accentBright; }}
                onMouseLeave={e => { if (!confirming) e.currentTarget.style.background = done ? C.green : C.accent; }}
              >
                {/* Loading spinner */}
                {confirming && !done && (
                  <div className="msm-spin" style={{
                    width: 16, height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    flexShrink: 0,
                  }} />
                )}
                {/* Success check */}
                {done && (
                  <svg className="msm-check" width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
                {/* Label */}
                {done ? "Plan activated!" : confirming ? "Activating…" : `Confirm — ${p.price}`}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}


// ─── UPDATED MEMBERSHIP PAGE (drop-in replacement for RepBase MembershipPage) ─
// Includes the Select popup wired to each plan card's Select button.
// Copy this function into RepBase.jsx to replace the existing MembershipPage.

export function MembershipPageWithModal() {
  const SANS_R = "'Inter', 'Helvetica Neue', Arial, sans-serif";
  const C_R = {
    surface:"#141618", card:"#1a1d1f", border:"#252829",
    accent:"#1e9bcc", accentBright:"#2db8ef", green:"#66bb6a",
    text:"#f0f2f4", textSub:"#8a9099",
  };

  const plans = [
    { name:"Monthly",    duration:"1 Month",  price:"₹1,500", access:"Basic",    popular:false },
    { name:"Quarterly",  duration:"3 Months", price:"₹4,000", access:"Standard", popular:true  },
    { name:"Semi-Annual",duration:"6 Months", price:"₹7,000", access:"Premium",  popular:false },
    { name:"Annual",     duration:"12 Months",price:"₹12,000",access:"Full",     popular:false },
  ];

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [activePlan,   setActivePlan]   = useState(plans[1]); // currently on Quarterly

  function handleConfirm(plan) {
    setActivePlan(plan);
    setSelectedPlan(null);
  }

  // Compute expiry for active plan display
  const activeExpiry = computeExpiry(activePlan.duration);
  const daysLeft = Math.ceil(
    (new Date(activeExpiry) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 28px", display: "flex", flexDirection: "column", gap: 20, fontFamily: SANS_R }}>

      {selectedPlan && (
        <MembershipSelectModal
          plan={selectedPlan}
          onConfirm={handleConfirm}
          onCancel={() => setSelectedPlan(null)}
        />
      )}

      {/* Current membership */}
      <div style={{ background: C_R.card, border: `1px solid ${C_R.border}`, borderRadius: 14, padding: "22px 24px" }}>
        <div style={{ fontFamily: SANS_R, fontSize: 12, color: C_R.textSub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
          Current membership details
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {[
            { label: "Plan",      value: activePlan.name },
            { label: "Status",    value: "Active",       accent: true },
            { label: "Expires",   value: activeExpiry },
            { label: "Gym",       value: "Iron Gym" },
            { label: "Access",    value: `${activePlan.access} Access` },
            { label: "Days Left", value: Math.max(0, daysLeft) },
          ].map(s => (
            <div key={s.label} style={{ background: C_R.surface, borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontFamily: SANS_R, fontSize: 11, color: C_R.textSub, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: SANS_R, fontSize: 15, fontWeight: 600, color: s.accent ? C_R.green : C_R.text }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Plans catalog */}
      <div>
        <div style={{ fontFamily: SANS_R, fontSize: 12, color: C_R.textSub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
          Membership plans catalog
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {plans.map(p => {
            const isCurrent = p.name === activePlan.name;
            return (
              <div key={p.name} style={{
                background: C_R.card,
                border: `1px solid ${isCurrent ? C_R.accent : p.popular ? C_R.accent + "55" : C_R.border}`,
                borderRadius: 12, padding: "18px 16px", position: "relative",
              }}>
                {p.popular && !isCurrent && (
                  <div style={{
                    position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                    background: C_R.accent, color: "#fff",
                    fontSize: 10, fontWeight: 700, fontFamily: SANS_R,
                    padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap",
                  }}>Most Popular</div>
                )}
                {isCurrent && (
                  <div style={{
                    position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                    background: C_R.green, color: "#fff",
                    fontSize: 10, fontWeight: 700, fontFamily: SANS_R,
                    padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap",
                  }}>Current Plan</div>
                )}
                <div style={{ fontFamily: SANS_R, fontSize: 14, fontWeight: 700, color: C_R.text, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontFamily: SANS_R, fontSize: 11, color: C_R.textSub, marginBottom: 12 }}>{p.duration}</div>
                <div style={{ fontFamily: SANS_R, fontSize: 22, fontWeight: 700, color: p.popular ? C_R.accentBright : C_R.text, marginBottom: 4 }}>{p.price}</div>
                <div style={{ fontFamily: SANS_R, fontSize: 11, color: C_R.textSub, marginBottom: 16 }}>{p.access} Access</div>
                <button
                  onClick={() => !isCurrent && setSelectedPlan(p)}
                  style={{
                    width: "100%", textAlign: "center", padding: "8px",
                    fontSize: 12, fontFamily: SANS_R, fontWeight: 500,
                    borderRadius: 8, cursor: isCurrent ? "default" : "pointer",
                    border: `1px solid ${isCurrent ? C_R.green + "50" : p.popular ? C_R.accent : C_R.border}`,
                    background: isCurrent ? "rgba(102,187,106,0.1)" : p.popular ? C_R.accent : "transparent",
                    color: isCurrent ? C_R.green : p.popular ? "#fff" : C_R.textSub,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { if (!isCurrent) { e.currentTarget.style.background = p.popular ? C_R.accentBright : "rgba(30,155,204,0.1)"; e.currentTarget.style.borderColor = C_R.accent; e.currentTarget.style.color = p.popular ? "#fff" : C_R.accentBright; } }}
                  onMouseLeave={e => { if (!isCurrent) { e.currentTarget.style.background = p.popular ? C_R.accent : "transparent"; e.currentTarget.style.borderColor = p.popular ? C_R.accent : C_R.border; e.currentTarget.style.color = p.popular ? "#fff" : C_R.textSub; } }}
                >
                  {isCurrent ? "✓ Active" : "Select"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
