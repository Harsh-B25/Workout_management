import { useState, useEffect } from "react";
import { adminService } from '../service/api';
import { Avatar } from "./AdminDashboard";
import { C, SANS, BODY } from '../utils/theme';

function statusMeta(s) {
  if (s === "Active")    return { bg: "rgba(102,187,106,0.12)", text: "#66bb6a", border: "rgba(102,187,106,0.3)" };
  if (s === "Expired")   return { bg: "rgba(239,83,80,0.12)",  text: "#ef5350", border: "rgba(239,83,80,0.3)" };
  if (s === "Suspended") return { bg: "rgba(255,167,38,0.12)", text: "#ffa726", border: "rgba(255,167,38,0.3)" };
  return { bg: C.accentDim, text: C.accentBright, border: "rgba(30,155,204,0.3)" };
}

const INPUT = {
  width: "100%", background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: 9, padding: "10px 13px", color: C.text,
  fontFamily: BODY, fontSize: 14, outline: "none",
  boxSizing: "border-box", transition: "border-color 0.15s",
};

// ─── MEMBER MODAL (Simplified for Delete/Info) ──────────────────────────────
function MemberModal({ member, onSave, onClose, onDelete }) {
  const isNew = !member;
  const [form, setForm] = useState(member ? { ...member } : {
  name: "",
  email: "",
  phone: "",
  date_of_birth: "",
  gender: "Male",
});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.surface, border: `1px solid ${C.borderMid}`, borderRadius: 16, width: 440, padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontFamily: SANS, color: C.text, margin: 0 }}>{isNew ? "New Member" : "Member Details"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.textSub, cursor: "pointer", fontSize: 20 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {isNew ? (
            <>
              <Field label="Full Name"><input value={form.name} onChange={e => set("name", e.target.value)} style={INPUT} /></Field>
              <Field label="Email"><input value={form.email} onChange={e => set("email", e.target.value)} style={INPUT} /></Field>
              <Field label="Phone"><input value={form.phone} onChange={e => set("phone", e.target.value)} style={INPUT} /></Field>
              <Field label="Date of Birth">
  <input 
    type="date"
    value={form.date_of_birth}
    onChange={e => set("date_of_birth", e.target.value)}
    style={INPUT}
  />
</Field>

<Field label="Gender">
  <select 
    value={form.gender}
    onChange={e => set("gender", e.target.value)}
    style={INPUT}
  >
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>
</Field>
              <button onClick={() => onSave(form)} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 9, padding: "12px", fontWeight: 600, cursor: "pointer", marginTop: 10 }}>Add Member</button>
            </>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 10 }}>
                <Avatar name={member.name} size={60} />
                <div style={{ color: C.text, fontWeight: 700, marginTop: 10 }}>{member.name}</div>
                <div style={{ color: C.textSub, fontSize: 12 }}>{member.email}</div>
              </div>
              <div style={{ background: C.card, padding: 12, borderRadius: 8, fontSize: 13, color: C.textSub }}>
                <div>Plan: <span style={{ color: C.text }}>{member.plan_name}</span></div>
                <div>Expires: <span style={{ color: C.text }}>{member.expiry_date}</span></div>
              </div>
              <button onClick={() => onDelete(member.member_id)} style={{ background: C.redDim, color: C.red, border: `1px solid ${C.red}40`, borderRadius: 9, padding: "12px", fontWeight: 600, cursor: "pointer", marginTop: 10 }}>
                Delete Member Permanentally
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontFamily: SANS, fontSize: 10, color: C.textDim, textTransform: "uppercase", marginBottom: 4, display: "block" }}>{label}</label>
      {children}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function ManageMembers({ onBack }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");

  const userid = localStorage.getItem("user_id"); // This should ideally come from user context or localStorage

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      setLoading(true);
      const res = await adminService.getMembers(userid);
      setMembers(res.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(form) {
    try {
      await adminService.addMember({
  name: form.name,
  password : "123" ,
  email: form.email,
  phone: form.phone,
  date_of_birth: form.date_of_birth,
  gender: form.gender,
  user_id: userid   // backend will resolve gym_id
});
      setToast("Member added successfully");
      setEditing(null);
      fetchMembers();
    } catch (err) { alert("Failed to add member"); }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure? This cannot be undone.")) return;
    try {
      await adminService.deleteMember(id);
      setToast("Member deleted");
      setEditing(null);
      fetchMembers();
    } catch (err) { alert("Delete failed"); }
  }

  const filtered = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={{ color: C.text, padding: 40, textAlign: "center" }}>Syncing Member Database...</div>;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 28px" }}>
      {editing && <MemberModal member={editing === "new" ? null : editing} onSave={handleSave} onClose={() => setEditing(null)} onDelete={handleDelete} />}
      
      {toast && <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: C.card, padding: "10px 20px", borderRadius: 8, color: C.green, border: `1px solid ${C.border}`, zIndex: 500 }}>{toast}</div>}

      <button onClick={onBack} style={{ background: "none", border: "none", color: C.textSub, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
        ← Back to Dashboard
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontFamily: SANS, fontSize: 22, color: C.text, margin: 0 }}>Manage Members</h2>
        <button onClick={() => setEditing("new")} style={{ background: C.accent, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
          + Add Member
        </button>
      </div>

      <input placeholder="Search members..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...INPUT, marginBottom: 20 }} />

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 80px", padding: "12px 20px", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
          {["Member", "Email", "Plan", "Status", ""].map(h => <div key={h} style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase" }}>{h}</div>)}
        </div>

        {filtered.map(m => {
          const sc = statusMeta(m.status);
          return (
            <div key={m.member_id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 80px", padding: "14px 20px", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar name={m.name} size={32} />
                <span style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{m.name}</span>
              </div>
              <div style={{ color: C.textSub, fontSize: 12 }}>{m.email}</div>
              <div style={{ color: C.text, fontSize: 12 }}>{m.plan_name}</div>
              <div>
                <span style={{ background: sc.bg, color: sc.text, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{m.status}</span>
              </div>
              <button onClick={() => setEditing(m)} style={{ background: "none", border: `1px solid ${C.border}`, color: C.textSub, padding: "5px", borderRadius: 6, cursor: "pointer" }}>Details</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}