import { useState, useEffect } from "react";
import { adminService , membershipService} from '../service/api';


// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
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
  purple:      "#ab47bc",
  purpleDim:   "rgba(171,71,188,0.12)",
  text:        "#f0f2f4",
  textSub:     "#8a9099",
  textDim:     "#4a5058",
};
const SANS = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const BODY = "'Inria Sans', Georgia, serif";

const ACCESS_LEVELS = ["Gym Access", "Gym + Cardio", "Full Access", "Custom"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function durationLabel(days) {
  if (days === 30)  return "1 Month";
  if (days === 90)  return "3 Months";
  if (days === 180) return "6 Months";
  if (days === 365) return "1 Year";
  return `${days} Days`;
}

function accessMeta(level) {
  if (level === "Full Access")      return { color: C.purple,       dim: C.purpleDim,  border: "rgba(171,71,188,0.3)" };
  if (level === "Gym + Cardio")     return { color: C.accentBright, dim: C.accentDim,  border: "rgba(30,155,204,0.3)" };
  if (level === "Gym Access")       return { color: C.green,        dim: C.greenDim,   border: "rgba(102,187,106,0.3)" };
  return                                   { color: C.amber,        dim: C.amberDim,   border: "rgba(255,167,38,0.3)" };
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
const INPUT = {
  width: "100%", background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: 9, padding: "10px 13px", color: C.text,
  fontFamily: BODY, fontSize: 14, outline: "none", boxSizing: "border-box",
};

function Field({ label, hint, children }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ fontFamily: SANS, fontSize: 11, color: C.textSub, textTransform: "uppercase" }}>{label}</label>
        {hint && <span style={{ fontFamily: BODY, fontSize: 11, color: C.textDim }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── PLAN MODAL ───
function PlanModal({ plan, onSave, onClose, onDelete }) {
  const isNew = !plan;
  const [form, setForm] = useState({
    // Check 'name' (from catalog) OR 'plan_name' (from previous form state)
    plan_name: plan?.name || plan?.plan_name || "", 
    duration: plan?.duration || 30,
    price: plan?.price || "",
    // Check 'access' (from catalog) OR 'access_level' (from modal state)
    access_level: plan?.access || plan?.access_level || "Gym Access",
    plan_id: plan?.plan_id || null
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: C.surface, borderRadius: 18, width: 450, padding: 26, border: `1px solid ${C.borderMid}` }}>
        <h3 style={{ fontFamily: SANS, color: C.text, margin: "0 0 20px" }}>{isNew ? "New Plan" : "Edit Plan"}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Plan Name">
            <input style={INPUT} value={form.plan_name} onChange={e => setForm({...form, plan_name: e.target.value})} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Duration (Days)">
              <input type="number" style={INPUT} value={form.duration} onChange={e => setForm({...form, duration: e.target.value || 30})} />
            </Field>
            <Field label="Price (₹)">
              <input type="number" style={INPUT} value={form.price} onChange={e => setForm({...form, price: e.target.value || 0})} />
            </Field>
          </div>
          <Field label="Access">
             <select style={INPUT} value={form.access_level} onChange={e => setForm({...form, access_level: e.target.value})}>
                {ACCESS_LEVELS.map(a => <option key={a} value={a}>{a}</option>)}
             </select>
          </Field>
          
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => onSave(form)} style={{ flex: 1, background: C.accent, color: "#fff", border: "none", padding: 12, borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Save</button>
            {!isNew && <button onClick={() => setConfirmDelete(true)} style={{ background: C.redDim, color: C.red, border: "none", padding: "0 15px", borderRadius: 8, cursor: "pointer" }}>Delete</button>}
            <button onClick={onClose} style={{ background: "none", border: `1px solid ${C.border}`, color: C.textSub, padding: "0 15px", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
          </div>

          {confirmDelete && (
            <div style={{ marginTop: 10, padding: 12, background: C.redDim, borderRadius: 8 }}>
                <p style={{ color: C.red, fontSize: 12, margin: "0 0 10px" }}>Are you sure? This cannot be undone.</p>
                <button onClick={() => onDelete(plan.plan_id)} style={{ background: C.red, color: "#fff", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}>Confirm Delete</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───
export default function ManageMemberships({onBack }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };
  const userId = localStorage.getItem("user_id");
  // 1. Fetch plans based on userId
  async function loadData() {
  try {
    const res = await membershipService.getPlans(userId);
    setPlans(res.data);
  } catch (e) {
    showToast("Failed to load plans.");
  } finally {
    setLoading(false);
  }
}
useEffect(() => {
  if (userId) loadData();
}, [userId]);

  // 2. Handle Save (Create or Update)
  // 2. Handle Save (Create or Update)
  async function handleSave(form) {
    try {
      let res;
      
      // Determine if we are updating an existing plan or creating a new one
      if (form.plan_id) {
        // UPDATE EXISTING
        console.log("Updating plan with data:", form);
        res = await adminService.updatePlan(form.plan_id, {
          ...form,
          user_id: userId
        });
        showToast("Plan updated successfully.");
      } else {
        // CREATE NEW
        res = await adminService.addPlan({
          ...form,
          user_id: userId
        });
        showToast("Plan created successfully.");
      }

      await loadData(); // Refresh the list from the server
      setEditing(null); // Close the modal

    } catch (e) {
    console.error("Save Error:", e);
    
    // Check if it's a FastAPI validation error (Array of objects)
    const errorData = e.response?.data?.detail;
    let message = "Error saving plan.";

    if (Array.isArray(errorData)) {
        // Extract just the message from the first error object
        message = errorData[0].msg || "Validation error";
    } else if (typeof errorData === 'string') {
        message = errorData;
    }

    showToast(message); // Now this is a string, so React won't crash
}
  }
  // 3. Handle Delete
  async function handleDelete(planId) {

  }

  if (loading) return <div style={{ color: C.textSub, padding: 40, textAlign: "center", fontFamily: SANS }}>Loading Catalog...</div>;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "36px 28px" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: C.card, border: `1px solid ${C.borderMid}`, padding: "10px 20px", borderRadius: 8, color: C.text, zIndex: 2000 }}>
          {toast}
        </div>
      )}

      {editing && (
        <PlanModal 
          plan={editing === "new" ? null : editing} 
          onSave={handleSave} 
          onClose={() => setEditing(null)} 
          onDelete={handleDelete}
        />
      )}

      <button onClick={onBack} style={{ background: "none", border: "none", color: C.textSub, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
        ← Back to Dashboard
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 30 }}>
        <div>
          <h2 style={{ fontFamily: SANS, fontSize: 24, color: C.text, margin: 0 }}>Membership Catalog</h2>
          <p style={{ fontFamily: BODY, color: C.textSub, margin: "4px 0 0" }}>Manage pricing and access for your gym</p>
        </div>
        <button onClick={() => setEditing("new")} style={{ background: C.accent, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
          + Create Plan
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {plans.map(p => {
          const am = accessMeta(p.access);
          return (
            <div key={p.plan_id} onClick={() => setEditing(p)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, cursor: "pointer", transition: "0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = C.accent}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ background: am.dim, color: am.color, fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 4, textTransform: "uppercase" }}>{p.access}</span>
                <span style={{ color: C.textSub, fontSize: 12 }}>{durationLabel(p.duration)}</span>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontFamily: SANS, fontSize: 24, fontWeight: 700, color: C.accentBright }}>₹{Number(p.price).toLocaleString()}</div>
              <div style={{ marginTop: 15, fontSize: 11, color: C.textDim, textAlign: "right" }}>Click to edit</div>
            </div>
          );
        })}
        
        {plans.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, border: `2px dashed ${C.border}`, borderRadius: 14, color: C.textDim }}>
                No active plans found for this gym.
            </div>
        )}
      </div>
    </div>
  );
}