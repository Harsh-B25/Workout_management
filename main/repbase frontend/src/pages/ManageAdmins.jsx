import { useState, useEffect } from "react";
import { adminService, devService } from "../service/api";

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

// Simple Avatar component to display initials
function Avatar({ name, size = 34 }) {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const hue = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: `hsl(${hue}, 40%, 25%)`,
      color: `hsl(${hue}, 10%, 80%)`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontFamily: SANS, fontWeight: 600, fontSize: size / 2.2,
    }}>
      {initials}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontFamily: SANS, fontSize: 11, color: C.textSub, display: "block", marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</label>
      {children}
    </div>
  );
}

// ─── ADMIN FORM MODAL ─────────────────────────────────────────────────────────
function AdminModal({ admin, gyms = [], onSave, onClose, onDelete }) {
  const isNew = !admin;
  const [form, setForm] = useState(admin ? { ...admin } : {
    name: "", email: "", phone: "", gym_id: gyms[0]?.gym_id || 1,
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (admin) {
      setForm(admin);
    } else {
      setForm({ name: "", email: "", phone: "", gym_id: gyms[0]?.gym_id || 1 });
    }
  }, [admin, gyms]);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: C.surface, border: `1px solid ${C.borderMid}`, borderRadius: 16, width: 480, padding: "28px 28px 24px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 16, color: C.text }}>{isNew ? "Add Gym Admin" : "Edit Gym Admin"}</div>
            {!isNew && <div style={{ fontFamily: BODY, fontSize: 12, color: C.textDim, marginTop: 2, fontWeight: 300 }}>Admin ID #{admin.admin_id}</div>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.textSub, cursor: "pointer", fontSize: 22, lineHeight: 1, padding: 0 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          <Field label="Full Name">
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Sunita Rao" style={INPUT} />
          </Field>

          <Field label="Email">
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="admin@gym.com" style={INPUT} />
          </Field>

          <Field label="Phone">
            <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="10-digit number" style={INPUT} />
          </Field>

          <Field label="Assign to Gym">
            <select value={form.gym_id} onChange={e => set("gym_id", Number(e.target.value))} style={INPUT}>
              {gyms.map(g => <option key={g.gym_id} value={g.gym_id}>{g.gym_name}</option>)}
            </select>
          </Field>

          <div style={{ height: 1, background: C.border }} />

          <div style={{ background: C.accentDim, border: "1px solid rgba(30,155,204,0.2)", borderRadius: 9, padding: "11px 14px", display: "flex", gap: 9 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accentBright} strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
            <p style={{ fontFamily: BODY, fontSize: 12, color: C.textSub, lineHeight: 1.55, margin: 0, fontWeight: 300 }}>
              {isNew
                ? "A default password will be generated and sent. The admin can change it after first login."
                : "To reset this admin's password, use the password reset option in the auth system."}
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={() => onSave(form)} style={{
              flex: 2, background: C.accent, border: "none", borderRadius: 9, padding: "11px",
              color: "#fff", fontFamily: SANS, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.accentBright}
              onMouseLeave={e => e.currentTarget.style.background = C.accent}
            >{isNew ? "Add Admin" : "Save Changes"}</button>
            {!isNew && (
              <button onClick={() => onDelete(form.admin_id)} style={{
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

// ─── MANAGE ADMINS PAGE ───────────────────────────────────────────────────────
export default function ManageAdmins({ setPage }) {
  const [admins, setAdmins] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [search, setSearch] = useState("");
  const [filterGym, setFilterGym] = useState("All");
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [adminsRes, gymsRes] = await Promise.all([
        adminService.getAdmins(),
        devService.getGyms(),
      ]);
      setAdmins(adminsRes.data);
      setGyms(gymsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      showToast("Error fetching data. See console.");
    }
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 2500); }

  async function handleSave(form) {
    if (!form.name.trim() || !form.email.trim()) {
      showToast("Name and email are required.");
      return;
    }
    try {
      if (editing === "new") {
        await adminService.addAdmin(form);
        showToast("Admin added successfully.");
      } else {
        await adminService.updateAdmin(form.admin_id, form);
        showToast("Admin updated.");
      }
      setEditing(null);
      fetchData(); // Refetch data to show changes
    } catch (error) {
      console.error("Save failed:", error);
      showToast("Save failed. See console.");
    }
  }

  async function handleDelete(id) {
    try {
      await adminService.deleteAdmin(id);
      showToast("Admin removed.");
      setEditing(null);
      fetchData(); // Refetch
    } catch (error) {
      console.error("Delete failed:", error);
      showToast("Delete failed. See console.");
    }
  }

  const filtered = admins.filter(a =>
    (filterGym === "All" || a.gym_id === Number(filterGym)) &&
    (a.name.toLowerCase().includes(search.toLowerCase()) ||
     a.email.toLowerCase().includes(search.toLowerCase()))
  );

  function gymName(id) {
    return gyms.find(g => g.gym_id === id)?.gym_name || `Gym #${id}`;
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 28px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inria+Sans:wght@300;400;700&family=Inter:wght@400;500;600;700&display=swap');
        input:focus, select:focus { border-color: ${C.borderFocus} !important; outline: none; }
        select option { background: ${C.surface}; color: ${C.text}; }
        ::placeholder { color: ${C.textDim}; font-family: 'Inria Sans', Georgia, serif; font-size: 13px; }
      `}</style>

      {editing && (
        <AdminModal
          admin={editing === "new" ? null : editing}
          gyms={gyms}
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
          <h2 style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Gym Admins</h2>
          <p style={{ fontFamily: BODY, fontSize: 13, color: C.textSub, margin: "5px 0 0", fontWeight: 300 }}>
            {admins.length} admin accounts · across {gyms.length} gyms
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
          Add Admin
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <input
            placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ ...INPUT, paddingLeft: 36 }}
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2" strokeLinecap="round"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        {/* Gym filter pills */}
        <button onClick={() => setFilterGym("All")} style={{
          background: filterGym === "All" ? C.accentDim : C.card,
          border: `1px solid ${filterGym === "All" ? C.accent : C.border}`,
          color: filterGym === "All" ? C.accentBright : C.textSub,
          borderRadius: 8, padding: "8px 14px", fontFamily: SANS, fontSize: 12,
          fontWeight: filterGym === "All" ? 600 : 400, cursor: "pointer", transition: "all 0.15s",
        }}>All Gyms</button>
        {gyms.map(g => (
          <button key={g.gym_id} onClick={() => setFilterGym(String(g.gym_id))} style={{
            background: filterGym === String(g.gym_id) ? C.accentDim : C.card,
            border: `1px solid ${filterGym === String(g.gym_id) ? C.accent : C.border}`,
            color: filterGym === String(g.gym_id) ? C.accentBright : C.textSub,
            borderRadius: 8, padding: "8px 14px", fontFamily: SANS, fontSize: 12,
            fontWeight: filterGym === String(g.gym_id) ? 600 : 400, cursor: "pointer", transition: "all 0.15s",
          }}>{g.gym_name}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        {/* Column headers */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.8fr 1.4fr 70px", padding: "10px 20px", borderBottom: `1px solid ${C.border}` }}>
          {["Admin","Contact","Assigned Gym",""].map(h => (
            <div key={h} style={{ fontFamily: SANS, fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: "52px 20px", textAlign: "center", fontFamily: BODY, fontSize: 14, color: C.textDim, fontWeight: 300 }}>No admins found.</div>
        )}

        {filtered.map((a, i) => (
          <div key={a.admin_id}
            style={{
              display: "grid", gridTemplateColumns: "2fr 1.8fr 1.4fr 70px",
              padding: "14px 20px", alignItems: "center",
              borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : "none",
              transition: "background 0.12s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            {/* Admin identity */}
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <Avatar name={a.name} size={34} />
              <div>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.text }}>{a.name}</div>
                <div style={{ fontFamily: BODY, fontSize: 11, color: C.textDim, marginTop: 1, fontWeight: 300 }}>Admin ID #{a.admin_id}</div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <div style={{ fontFamily: BODY, fontSize: 12, color: C.textSub }}>{a.email}</div>
              <div style={{ fontFamily: BODY, fontSize: 11, color: C.textDim, marginTop: 1, fontWeight: 300 }}>{a.phone}</div>
            </div>

            {/* Gym pill */}
            <div>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: C.accentDim, color: C.accentBright,
                border: "1px solid rgba(30,155,204,0.25)", borderRadius: 20,
                padding: "3px 12px", fontFamily: SANS, fontSize: 11, fontWeight: 500,
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
                {gymName(a.gym_id)}
              </span>
            </div>

            {/* Edit button */}
            <button onClick={() => setEditing(a)} style={{
              background: "none", border: `1px solid ${C.border}`, borderRadius: 7,
              padding: "5px 12px", color: C.textSub, fontFamily: SANS, fontSize: 11,
              cursor: "pointer", transition: "all 0.12s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accentBright; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border;  e.currentTarget.style.color = C.textSub; }}
            >Edit</button>
          </div>
        ))}
      </div>

      {filtered.length > 0 && (
        <div style={{ fontFamily: BODY, fontSize: 12, color: C.textDim, marginTop: 10, textAlign: "right", fontWeight: 300 }}>
          Showing {filtered.length} of {admins.length} admins
        </div>
      )}
    </div>
  );
}
