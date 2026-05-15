import { useState, useEffect } from "react";
import { devService } from "../service/api";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
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
  amber:       "#ffa726",
  text:        "#f0f2f4",
  textSub:     "#8a9099",
  textDim:     "#4a5058",
};
const SANS = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const BODY = "'Inria Sans', Georgia, serif";

const INPUT = {
  width: "100%", background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: 9, padding: "10px 13px", color: C.text,
  fontFamily: BODY, fontSize: 14, outline: "none",
  boxSizing: "border-box", transition: "border-color 0.15s",
};

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontFamily: SANS, fontSize: 11, color: C.textSub, display: "block", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>
      {children}
    </div>
  );
}

// ─── GYM FORM MODAL ───────────────────────────────────────────────────────────
function GymModal({ gym, onSave, onClose, onDelete }) {
  const isNew = !gym;
  const [form, setForm] = useState(gym ? { ...gym } : {
    gym_name: "", location: "", contact_number: "",
    member_count: 0, trainer_count: 0, admin_count: 0,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: C.surface, border: `1px solid ${C.borderMid}`, borderRadius: 16, width: 480, padding: "28px 28px 24px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 16, color: C.text }}>{isNew ? "Add New Gym" : "Edit Gym"}</div>
            {!isNew && <div style={{ fontFamily: BODY, fontSize: 12, color: C.textDim, marginTop: 2, fontWeight: 300 }}>Gym ID #{gym.gym_id}</div>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.textSub, cursor: "pointer", fontSize: 22, lineHeight: 1, padding: 0 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Gym Name">
            <input value={form.gym_name} onChange={e => set("gym_name", e.target.value)} placeholder="e.g. Iron Gym" style={INPUT} />
          </Field>

          <Field label="Location">
            <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. New Delhi" style={INPUT} />
          </Field>

          <Field label="Contact Number">
            <input value={form.contact_number} onChange={e => set("contact_number", e.target.value)} placeholder="Phone number" style={INPUT} />
          </Field>

          {/* Divider */}
          <div style={{ height: 1, background: C.border }} />

          {!isNew && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              <div style={{ background: C.card, borderRadius: 9, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: C.text }}>{form.member_count}</div>
                <div style={{ fontFamily: BODY, fontSize: 11, color: C.textDim, marginTop: 3, fontWeight: 300 }}>Members</div>
              </div>
              <div style={{ background: C.card, borderRadius: 9, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: C.green }}>{form.trainer_count}</div>
                <div style={{ fontFamily: BODY, fontSize: 11, color: C.textDim, marginTop: 3, fontWeight: 300 }}>Trainers</div>
              </div>
              <div style={{ background: C.card, borderRadius: 9, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: C.accentBright }}>{form.admin_count}</div>
                <div style={{ fontFamily: BODY, fontSize: 11, color: C.textDim, marginTop: 3, fontWeight: 300 }}>Admins</div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={() => onSave(form)} style={{
              flex: 2, background: C.accent, border: "none", borderRadius: 9, padding: "11px",
              color: "#fff", fontFamily: SANS, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.accentBright}
              onMouseLeave={e => e.currentTarget.style.background = C.accent}
            >{isNew ? "Add Gym" : "Save Changes"}</button>
            {!isNew && (
              <button onClick={() => onDelete(form.gym_id)} style={{
                flex: 1, background: C.redDim, border: "1px solid rgba(239,83,80,0.3)",
                borderRadius: 9, padding: "11px", color: C.red, fontFamily: SANS, fontSize: 13, cursor: "pointer",
              }}>Remove</button>
            )}
            <button onClick={onClose} style={{
              flex: 1, background: "none", border: `1px solid ${C.border}`, borderRadius: 9,
              padding: "11px", color: C.textSub, fontFamily: SANS, fontSize: 13, cursor: "pointer",
            }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MANAGE GYMS PAGE ─────────────────────────────────────────────────────────
// Props:
//   setPage         – () => void
export default function ManageGyms({ setPage }) {
  const [gyms,    setGyms]    = useState([]);
  const [search,  setSearch]  = useState("");
  const [editing, setEditing] = useState(null);
  const [toast,   setToast]   = useState("");

  useEffect(() => {
    fetchGyms();
  }, []);

  async function fetchGyms() {
    try {
      const response = await devService.getGyms();
      setGyms(response.data);
    } catch (error) {
      console.error("Failed to fetch gyms:", error);
      showToast("Failed to load gyms.");
    }
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  async function handleSave(form) {
    if (!form.gym_name.trim()) {
      showToast("Gym name is required.");
      return;
    }
    try {
      if (editing === "new") {
        await devService.addGym(form);
        showToast("Gym enrolled successfully.");
      } else {
        const { gym_name, location, contact_number } = form;
        await devService.updateGym(form.gym_id, { gym_name, location, contact_number });
        showToast("Gym updated.");
      }
      setEditing(null);
      fetchGyms(); // Refresh data
    } catch (error) {
      console.error("Failed to save gym:", error);
      showToast("Error saving gym.");
    }
  }

  async function handleDelete(id) {
    try {
      await devService.deleteGym(id);
      showToast("Gym removed from platform.");
      setEditing(null);
      fetchGyms(); // Refresh data
    } catch (error) {
      console.error("Failed to delete gym:", error);
      showToast("Error removing gym.");
    }
  }

  const filtered = gyms.filter(g =>
    g.gym_name.toLowerCase().includes(search.toLowerCase()) ||
    g.location.toLowerCase().includes(search.toLowerCase())
  );

  const totalMembers  = Array.isArray(gyms) ? gyms.reduce((a, g) => a + g.member_count, 0) : 0;
  const totalTrainers = Array.isArray(gyms) ? gyms.reduce((a, g) => a + g.trainer_count, 0) : 0;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 28px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inria+Sans:wght@300;400;700&family=Inter:wght@400;500;600;700&display=swap');
        input:focus, select:focus { border-color: ${C.borderFocus} !important; outline: none; }
        ::placeholder { color: ${C.textDim}; font-family: 'Inria Sans', Georgia, serif; font-size: 13px; }
      `}</style>

      {editing && (
        <GymModal
          gym={editing === "new" ? null : editing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
          onDelete={handleDelete}
        />
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", zIndex: 400,
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
          padding: "11px 20px", fontFamily: SANS, fontSize: 13, color: C.text,
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
          {toast}
        </div>
      )}

      {/* Back */}
      <button onClick={() => setPage("dev")} style={{ background: "none", border: "none", color: C.textSub, fontFamily: SANS, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 24, padding: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        Dev Dashboard
      </button>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Gyms</h2>
          <p style={{ fontFamily: BODY, fontSize: 13, color: C.textSub, margin: "5px 0 0", fontWeight: 300 }}>
            {gyms.length} gyms · {totalMembers} members · {totalTrainers} trainers platform-wide
          </p>
        </div>
        <button onClick={() => setEditing("new")} style={{
          background: C.accent, border: "none", borderRadius: 9, padding: "9px 18px",
          color: "#fff", fontFamily: SANS, fontSize: 13, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6, transition: "background 0.15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = C.accentBright}
          onMouseLeave={e => e.currentTarget.style.background = C.accent}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Enrol Gym
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16, maxWidth: 360 }}>
        <input
          placeholder="Search by gym name or location…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ ...INPUT, paddingLeft: 36 }}
        />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2" strokeLinecap="round"
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>

      {/* Grid of gym cards */}
      {filtered.length === 0 && (
        <div style={{ padding: "52px 0", textAlign: "center", fontFamily: BODY, fontSize: 14, color: C.textDim, fontWeight: 300 }}>No gyms found.</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 12 }}>
        {filtered.map(g => (
          <div key={g.gym_id}
            onClick={() => setEditing(g)}
            style={{
              background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
              padding: "20px", cursor: "pointer", transition: "all 0.15s",
              display: "flex", flexDirection: "column", gap: 14,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderMid; e.currentTarget.style.background = C.cardHover; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border;    e.currentTarget.style.background = C.card; }}
          >
            {/* Top */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              {/* Building icon avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: C.accentDim, border: `1.5px solid rgba(30,155,204,0.25)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.accentBright} strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.text }}>{g.gym_name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2" strokeLinecap="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span style={{ fontFamily: BODY, fontSize: 12, color: C.textDim, fontWeight: 300 }}>{g.location}</span>
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </div>

            <div style={{ height: 1, background: C.border }} />

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { label: "Members",  value: g.member_count,  color: C.text },
                { label: "Trainers", value: g.trainer_count, color: C.green },
                { label: "Admins",   value: g.admin_count,   color: C.accentBright },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontFamily: BODY, fontSize: 11, color: C.textDim, marginTop: 2, fontWeight: 300 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2" strokeLinecap="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6A16 16 0 0 0 15.4 16.09l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span style={{ fontFamily: BODY, fontSize: 12, color: C.textDim, fontWeight: 300 }}>{g.contact_number}</span>
            </div>
          </div>
        ))}

        {/* Add gym card */}
        <div
          onClick={() => setEditing("new")}
          style={{
            background: "transparent", border: `2px dashed ${C.border}`, borderRadius: 14,
            padding: "20px", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 10,
            cursor: "pointer", transition: "all 0.15s", minHeight: 180,
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}
          onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
        >
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.accentDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.accentBright} strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <span style={{ fontFamily: SANS, fontSize: 13, color: C.textSub }}>Enrol New Gym</span>
        </div>
      </div>
    </div>
  );
}
