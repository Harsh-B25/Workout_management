import { useState, useEffect } from "react";
import { adminService } from '../service/api';
import { Avatar } from "./AdminDashboard";
import { C, SANS, BODY } from '../utils/theme';

const INPUT = {
  width: "100%", background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: 9, padding: "10px 13px", color: C.text,
  fontFamily: BODY, fontSize: 14, outline: "none",
  boxSizing: "border-box", transition: "border-color 0.15s",
};

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontFamily: SANS, fontSize: 10, color: C.textDim, textTransform: "uppercase", marginBottom: 4, display: "block" }}>{label}</label>
      {children}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function TrainerModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: "", specialization: "", phone: "", schedule: ""
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.surface, border: `1px solid ${C.borderMid}`, borderRadius: 16, width: 440, padding: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontFamily: SANS, color: C.text, margin: 0 }}>Add Trainer</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.textSub, cursor: "pointer", fontSize: 20 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Name">
            <input value={form.name} onChange={e => set("name", e.target.value)} style={INPUT} />
          </Field>
          <Field label="Specialization">
            <input value={form.specialization} onChange={e => set("specialization", e.target.value)} style={INPUT} />
          </Field>
          <Field label="Phone">
            <input value={form.phone} onChange={e => set("phone", e.target.value)} style={INPUT} />
          </Field>
          <Field label="Schedule">
            <input value={form.schedule} onChange={e => set("schedule", e.target.value)} style={INPUT} />
          </Field>
          <button onClick={() => onSave(form)} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 9, padding: "12px", fontWeight: 600, cursor: "pointer", marginTop: 10 }}>Add Trainer</button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ManageTrainers({ onBack }) {

  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState("");

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    fetchTrainers();
  }, []);

  async function fetchTrainers() {
    try {
      setLoading(true);
      const res = await adminService.getTrainers(userId);
      setTrainers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  async function handleSave(form) {
    try {
      await adminService.addTrainer({
        name: form.name,
        specialization: form.specialization,
        phone: form.phone,
        schedule: form.schedule,
        user_id: userId
      });
      showToast("Trainer added");
      setEditing(false);
      fetchTrainers();
    } catch (err) {
      showToast("Error adding trainer");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete trainer?")) return;
    try {
      await adminService.deleteTrainer(id);
      showToast("Deleted");
      fetchTrainers();
    } catch {
      showToast("Delete failed");
    }
  }

  const filtered = trainers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div style={{ color: C.text, padding: 40 }}>Loading trainers...</div>;
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 28px" }}>
      {editing && <TrainerModal onSave={handleSave} onClose={() => setEditing(false)} />}
      {toast && <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: C.card, padding: "10px 20px", borderRadius: 8, color: C.green, border: `1px solid ${C.border}`, zIndex: 500 }}>{toast}</div>}
      
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.textSub, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
        ← Back to Dashboard
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ fontFamily: SANS, fontSize: 22, color: C.text, margin: 0 }}>Manage Trainers</h2>
        <button onClick={() => setEditing(true)} style={{ background: C.accent, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
          + Add Trainer
        </button>
      </div>

      <input
        placeholder="Search trainers..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ ...INPUT, marginBottom: 20 }}
      />

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 80px", padding: "12px 20px", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
          {["Trainer", "Specialization", "Phone", "Schedule", ""].map(h => <div key={h} style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase" }}>{h}</div>)}
        </div>

        {filtered.map(t => (
          <div key={t.trainer_id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr 80px", padding: "14px 20px", alignItems: "center", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar name={t.name} size={32} />
              <span style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{t.name}</span>
            </div>
            <div style={{ color: C.textSub, fontSize: 12 }}>{t.specialization}</div>
            <div style={{ color: C.text, fontSize: 12 }}>{t.phone}</div>
            <div style={{ color: C.text, fontSize: 12 }}>{t.schedule}</div>
            <button onClick={() => handleDelete(t.trainer_id)} style={{ background: C.redDim, color: C.red, border: `1px solid ${C.red}40`, borderRadius: 9, padding: "8px 12px", fontWeight: 600, cursor: "pointer" }}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
