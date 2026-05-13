import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS (matches RepBase.jsx exactly) ──────────────────────────────
const C = {
  bg:          "#0d0f10",
  surface:     "#141618",
  card:        "#1a1d1f",
  border:      "#252829",
  borderMid:   "#2e3235",
  borderFocus: "#1e9bcc",
  accent:      "#1e9bcc",
  accentBright:"#2db8ef",
  accentDim:   "rgba(30,155,204,0.12)",
  green:       "#66bb6a",
  greenDim:    "rgba(102,187,106,0.1)",
  amber:       "#ffa726",
  red:         "#ef5350",
  redDim:      "rgba(239,83,80,0.1)",
  text:        "#f0f2f4",
  textSub:     "#8a9099",
  textDim:     "#4a5058",
};
const SANS = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const BODY = "'Inria Sans', Georgia, serif";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fmtDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function fmtDatetime(date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  }) + " · " + date.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

// ─── FINISH WORKOUT MODAL ─────────────────────────────────────────────────────
// Props:
//   exs      – exercise array from LogWorkout state
//              each ex has: { name, sets: [{ kg, reps, done }] }
//   elapsed  – elapsed seconds (number) from LogWorkout timer
//   onSave   – (title: string) => void  called when user confirms
//   onCancel – () => void               called when user dismisses
//
// Usage in LogWorkout — replace the Finish button onClick:
//   const [showFinish, setShowFinish] = useState(false);
//   ...
//   <button onClick={() => setShowFinish(true)}>Finish</button>
//   {showFinish && (
//     <FinishWorkoutModal
//       exs={exs}
//       elapsed={elapsed}
//       onSave={(title) => { onFinish(exs, elapsed, title); }}
//       onCancel={() => setShowFinish(false)}
//     />
//   )}

export default function FinishWorkoutModal({ exs = [], elapsed = 0, onSave, onCancel }) {
  const [title, setTitle]     = useState("");
  const [saving, setSaving]   = useState(false);
  const [done,   setDone]     = useState(false);
  const inputRef              = useRef(null);
  const now                   = useRef(new Date());

  // Computed stats
  const totalSets   = exs.reduce((a, ex) => a + ex.sets.filter(s => s.done).length, 0);
  const totalVol    = exs.reduce((a, ex) => a + ex.sets.filter(s => s.done).reduce((b, s) => b + (s.kg * s.reps), 0), 0);
  const exCount     = exs.length;

  // Auto-focus title input
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape" && !saving) onCancel(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [saving, onCancel]);

  async function handleSave() {
    if (saving || done) return;
    
    setSaving(true);
    try {
      // 1. Call the parent save function (API call)
      await onSave(title.trim()); 
      
      // 2. If successful, show the "Saved!" checkmark
      setDone(true); 
    } catch (err) {
      // 3. Reset saving if API fails so user can try again
      setSaving(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSave();
  }

  const stats = [
    {
      label: "Duration",
      value: fmtDuration(elapsed),
      color: C.accentBright,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
        </svg>
      ),
    },
    {
      label: "Volume",
      value: totalVol > 0 ? `${totalVol.toLocaleString("en-IN")} kg` : "—",
      color: C.green,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M6 5v14M18 5v14M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/>
        </svg>
      ),
    },
    {
      label: "Sets",
      value: totalSets,
      color: C.amber,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
    },
    {
      label: "Exercises",
      value: exCount,
      color: C.text,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inria+Sans:wght@300;400;700&family=Inter:wght@400;500;600;700&display=swap');

        @keyframes fwm-backdrop {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fwm-slide {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes fwm-check {
          0%   { transform: scale(0.4); opacity: 0; }
          60%  { transform: scale(1.2); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes fwm-spin {
          to { transform: rotate(360deg); }
        }

        .fwm-backdrop { animation: fwm-backdrop 0.2s ease both; }
        .fwm-card     { animation: fwm-slide 0.3s cubic-bezier(0.22,1,0.36,1) both; }
        .fwm-check    { animation: fwm-check 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .fwm-spin     { animation: fwm-spin 0.7s linear infinite; }

        .fwm-input {
          width: 100%;
          background: ${C.card};
          border: 1.5px solid ${C.border};
          border-radius: 10px;
          padding: 12px 16px;
          color: ${C.text};
          font-family: ${BODY};
          font-size: 16px;
          font-weight: 400;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.18s;
          caret-color: ${C.accentBright};
        }
        .fwm-input:focus { border-color: ${C.borderFocus}; }
        .fwm-input::placeholder { color: ${C.textDim}; font-family: ${BODY}; font-size: 15px; }

        .fwm-stat-card {
          background: ${C.card};
          border: 1px solid ${C.border};
          border-radius: 11px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: border-color 0.15s;
        }
        .fwm-stat-card:hover { border-color: ${C.borderMid}; }

        .fwm-btn-save {
          width: 100%;
          border: none;
          border-radius: 10px;
          padding: 13px;
          font-family: ${SANS};
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.18s, transform 0.1s;
        }
        .fwm-btn-save:active { transform: scale(0.98); }

        .fwm-btn-cancel {
          width: 100%;
          background: none;
          border: 1px solid ${C.border};
          border-radius: 10px;
          padding: 11px;
          color: ${C.textSub};
          font-family: ${SANS};
          font-size: 13px;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s;
        }
        .fwm-btn-cancel:hover { border-color: ${C.borderMid}; color: ${C.text}; }
      `}</style>

      {/* Backdrop */}
      <div
        className="fwm-backdrop"
        onClick={e => { if (e.target === e.currentTarget && !saving) onCancel(); }}
        style={{
          position: "fixed", inset: 0, zIndex: 500,
          background: "rgba(0,0,0,0.75)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px",
        }}
      >
        {/* Modal card */}
        <div className="fwm-card" style={{
          width: "100%", maxWidth: 440,
          background: C.surface,
          border: `1px solid ${C.borderMid}`,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
        }}>

          {/* ── Top accent strip ── */}
          <div style={{
            height: 3,
            background: `linear-gradient(90deg, ${C.accent}, ${C.accentBright})`,
          }}/>

          {/* ── Header ── */}
          <div style={{ padding: "22px 24px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: C.accentDim,
                  border: `1px solid rgba(30,155,204,0.25)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.accentBright} strokeWidth="2" strokeLinecap="round">
                    <path d="M6 5v14M18 5v14M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: C.text }}>Finish Workout</div>
                  <div style={{ fontFamily: BODY, fontSize: 12, color: C.textDim, marginTop: 1, fontWeight: 300 }}>
                    {fmtDatetime(now.current)}
                  </div>
                </div>
              </div>
              {!saving && (
                <button onClick={onCancel} style={{
                  background: "none", border: "none", color: C.textSub,
                  cursor: "pointer", fontSize: 22, lineHeight: 1, padding: 0,
                  marginTop: 2,
                }}>×</button>
              )}
            </div>
          </div>

          {/* ── Stats grid ── */}
          <div style={{ padding: "20px 24px 0" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {stats.map(s => (
                <div key={s.label} className="fwm-stat-card">
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: s.color }}>
                    {s.icon}
                    <span style={{ fontFamily: SANS, fontSize: 11, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {s.label}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: SANS, fontSize: 22, fontWeight: 700,
                    color: s.color, lineHeight: 1,
                  }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Exercise list preview ── */}
          {exs.length > 0 && (
            <div style={{ padding: "16px 24px 0" }}>
              <div style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 11, overflow: "hidden",
              }}>
                <div style={{
                  padding: "9px 14px",
                  borderBottom: `1px solid ${C.border}`,
                  fontFamily: SANS, fontSize: 10, color: C.textDim,
                  textTransform: "uppercase", letterSpacing: "0.07em",
                }}>Exercises logged</div>
                {exs.slice(0, 4).map((ex, i) => {
                  const doneSets = ex.sets.filter(s => s.done).length;
                  return (
                    <div key={i} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "9px 14px",
                      borderBottom: i < Math.min(exs.length, 4) - 1 ? `1px solid ${C.border}` : "none",
                    }}>
                      <span style={{ fontFamily: SANS, fontSize: 12, color: C.text }}>{ex.name}</span>
                      <span style={{
                        fontFamily: SANS, fontSize: 11, fontWeight: 600,
                        color: doneSets > 0 ? C.accentBright : C.textDim,
                      }}>{doneSets} set{doneSets !== 1 ? "s" : ""}</span>
                    </div>
                  );
                })}
                {exs.length > 4 && (
                  <div style={{
                    padding: "8px 14px",
                    fontFamily: BODY, fontSize: 12, color: C.textDim,
                    fontWeight: 300, textAlign: "center",
                  }}>+{exs.length - 4} more exercise{exs.length - 4 !== 1 ? "s" : ""}</div>
                )}
              </div>
            </div>
          )}

          {/* ── Title input ── */}
          <div style={{ padding: "16px 24px 0" }}>
            <label style={{
              fontFamily: SANS, fontSize: 11, color: C.textSub,
              display: "block", marginBottom: 7,
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>Workout Title</label>
            <input
              ref={inputRef}
              className="fwm-input"
              type="text"
              placeholder="e.g. Evening Push Day"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={80}
              disabled={saving}
            />
            <div style={{
              display: "flex", justifyContent: "space-between",
              marginTop: 5,
            }}>
              <span style={{ fontFamily: BODY, fontSize: 11, color: C.textDim, fontWeight: 300 }}>
                Leave blank to use "My Workout"
              </span>
              <span style={{ fontFamily: SANS, fontSize: 11, color: title.length > 60 ? C.amber : C.textDim }}>
                {title.length}/80
              </span>
            </div>
          </div>

          {/* ── Actions ── */}
          <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Save button */}
            <button
              className="fwm-btn-save"
              onClick={handleSave}
              disabled={saving}
              style={{
                background: done ? C.green : C.accent,
                color: "#fff",
              }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.background = done ? C.green : C.accentBright; }}
              onMouseLeave={e => { if (!saving) e.currentTarget.style.background = done ? C.green : C.accent; }}
            >
              {saving && !done && (
                <div className="fwm-spin" style={{
                  width: 16, height: 16,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                }}/>
              )}
              {done && (
                <svg className="fwm-check" width="16" height="16" viewBox="0 0 24 24"
                  fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              )}
              {!saving && !done && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              )}
              {done ? "Saved!" : saving ? "Saving…" : "Save Workout"}
            </button>

            {/* Cancel */}
            {!saving && (
              <button className="fwm-btn-cancel" onClick={onCancel}>
                Keep logging
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
