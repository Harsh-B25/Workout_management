import { useState } from "react";
import { C, SANS, EXERCISES_DB } from '../utils/constants';
import { Tag } from './shared/Tag';

const MUSCLE_GROUPS = ["All", "Chest", "Back", "Shoulders", "Biceps", "Triceps", "Abs", "Quads", "Hamstrings", "Glutes", "Cardio"];

export default function ExercisePicker({ onSelect, onClose }) {
  const [search, setSearch] = useState("");
  const [muscle, setMuscle] = useState("All");

  const filtered = EXERCISES_DB.filter(e =>
    (muscle === "All" || e.muscles.includes(muscle)) &&
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 200, display: "flex", alignItems: "center", justifyCenter: "center" }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, width: 500, maxHeight: "70vh", overflow: "hidden" }}>
        <div style={{ padding: 20, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyBetween: "center", marginBottom: 12 }}>
            <span style={{ color: C.text, fontWeight: 600 }}>Add Exercise</span>
            <button onClick={onClose} style={{ background: "none", border: "none", color: C.textSub, cursor: "pointer", fontSize: 20 }}>×</button>
          </div>
          <input 
            placeholder="Search exercises..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10, color: C.text }}
          />
        </div>
        <div style={{ overflowY: "auto", maxHeight: "50vh" }}>
          {filtered.map(ex => (
            <button key={ex.id} onClick={() => onSelect(ex)} style={{ width: "100%", padding: 15, background: "none", borderBottom: `1px solid ${C.border}`, textAlign: "left", cursor: "pointer" }}>
              <div style={{ color: C.text, fontSize: 14, fontWeight: 500 }}>{ex.name}</div>
              <div style={{ color: C.textSub, fontSize: 11 }}>{ex.muscles.join(", ")}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}