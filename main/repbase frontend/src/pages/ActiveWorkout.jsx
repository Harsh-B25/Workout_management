/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { C, SANS } from '../utils/theme';
import { StatPill } from '../components/shared/StatPill';
import ExercisePicker from "../components/ExercisePicker";
import { Btn } from '../components/shared/Btn';
import { Divider } from '../components/shared/Divider';
import { workoutService } from '../service/api'; // Import your API service
import FinishWorkoutModal from "./FinishWorkoutModal";



export default function ActiveWorkout({  initialRoutine, onFinish, onDiscard }) {
  // State Initialization
  const [exs, setExs] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  
  // Timer State
  const [elapsed, setElapsed] = useState(0);
  const [restTimer, setRestTimer] = useState(null); 
  const timerRef = useRef();
  const restRef = useRef();

  // Load Initial Exercises (Dynamic from initialRoutine)
  useEffect(() => {
    if (initialRoutine && initialRoutine.exercises) {
      setExs(initialRoutine.exercises.map(ex => ({
        ...ex,
        sets: [{ no: 1, kg: 0, reps: 10, done: false }],
        notes: ""
      })));
    }
  }, [initialRoutine]);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (restTimer === null) return;
    if (restTimer <= 0) { setRestTimer(null); return; }
    restRef.current = setTimeout(() => setRestTimer(r => r - 1), 1000);
    return () => clearTimeout(restRef.current);
  }, [restTimer]);

  // Calculations
  const totalVol = exs.reduce((a, ex) => a + ex.sets.filter(s => s.done).reduce((b, s) => b + (s.kg * s.reps), 0), 0);
  const totalSets = exs.reduce((a, ex) => a + ex.sets.filter(s => s.done).length, 0);
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Helper functions
  function addExercise(ex) { 
    setExs(p => [...p, { ...ex, sets: [{ no: 1, kg: 0, reps: 10, done: false }], notes: "" }]); 
    setShowPicker(false); 
  }
  
  function addSet(ei) { 
    setExs(p => p.map((ex, i) => i !== ei ? ex : { 
      ...ex, 
      sets: [...ex.sets, { no: ex.sets.length + 1, kg: ex.sets.at(-1)?.kg || 0, reps: ex.sets.at(-1)?.reps || 10, done: false }] 
    })); 
  }
  
  function updateSet(ei, si, field, val) { 
    setExs(p => p.map((ex, i) => i !== ei ? ex : { 
      ...ex, 
      sets: ex.sets.map((s, j) => j !== si ? s : { ...s, [field]: field === "done" ? val : parseFloat(val) || 0 }) 
    })); 
  }
  
  function toggleDone(ei, si) {
    const isNowDone = !exs[ei].sets[si].done;
    updateSet(ei, si, "done", isNowDone);
    if (isNowDone) setRestTimer(180); // 3min rest
  }

  // --- NEW: API SYNC LOGIC ---
  const handleFinalSave = async (userSelectedTitle) => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return alert("User ID not found.");
    
    // Filter to only include exercises that actually have 'done' sets
    const completedExercises = exs.filter(ex => ex.sets.some(s => s.done));
    if (completedExercises.length === 0) return alert("No completed sets to save.");

    const totalVol = exs.reduce((a, ex) => 
      a + ex.sets.filter(s => s.done).reduce((b, s) => b + (parseFloat(s.kg) * parseInt(s.reps)), 0), 0
    );

    const workoutData = {
      user_id: parseInt(userId),
      // Priority: 1. Modal Input, 2. Routine Name, 3. Default
      name: userSelectedTitle || initialRoutine?.name || "Custom Workout",
      duration: Math.round(elapsed / 60) || 1,
      volume: totalVol,
      date: new Date().toISOString().split('T')[0],
      exercises: completedExercises.map(ex => ({
        exercise_id: ex.id,
        sets: ex.sets.filter(s => s.done).map(s => ({
          weight_kg: parseFloat(s.kg) || 0,
          reps: parseInt(s.reps) || 0
        }))
      }))
    };

    try {
      setIsFinishing(true);
      await workoutService.saveWorkout(workoutData); 
      onFinish(); // Redirect/Success callback
    } catch (err) {
      console.error("Save failed:", err);
      alert("Error saving workout.");
    } finally {
      setIsFinishing(false);
    }
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 28px 40px" }}>
      {showPicker && <ExercisePicker onSelect={addExercise} onClose={() => setShowPicker(false)} />}

      <div style={{ position: "sticky", top: 52, background: C.bg, zIndex: 50, padding: "14px 0 10px", borderBottom: `1px solid ${C.border}`, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={onDiscard} style={{ background: "none", border: "none", cursor: "pointer", color: C.textSub }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 9l-7 7-7-7" /></svg>
            </button>
            <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.text }}>Log Workout</span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button 
              disabled={isFinishing}
              onClick={() => setShowFinishModal(true)}
              style={{
                background: isFinishing ? C.border : C.accent, border: "none", borderRadius: 8, padding: "7px 20px",
                color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: SANS, cursor: isFinishing ? "not-allowed" : "pointer",
              }}
            >
              {isFinishing ? "Saving..." : "Finish"}
            </button>
            { showFinishModal && (
              <FinishWorkoutModal 
                onClose={() => setShowFinishModal(false)} 
                onSave={handleFinalSave} 
                exs ={exs}
                elapsed={elapsed}
                defaultTitle={initialRoutine?.name || "Custom Workout"}
              />
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          <StatPill label="Duration" value={<span style={{ color: C.accentBright }}>{fmt(elapsed)}</span>} accent />
          <StatPill label="Volume" value={`${totalVol.toLocaleString()} kg`} />
          <StatPill label="Sets" value={totalSets} />
          {restTimer !== null && (
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, background: C.accentDim, border: `1px solid ${C.accent}`, borderRadius: 8, padding: "4px 12px" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.accentBright} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
              <span style={{ fontFamily: SANS, fontSize: 12, color: C.accentBright, fontWeight: 600 }}>Rest: {Math.floor(restTimer / 60)}m {restTimer % 60}s</span>
              <button onClick={() => setRestTimer(null)} style={{ background: "none", border: "none", color: C.textSub, cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {exs.map((ex, ei) => (
          <div key={ei} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyCenter: "center", flexShrink: 0 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.accentBright} strokeWidth="1.8" strokeLinecap="round"><path d="M6 5v14M18 5v14M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12" /></svg>
              </div>
              <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.accentBright, flex: 1 }}>{ex.name}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 80px 80px 44px", padding: "8px 18px", gap: 8 }}>
              {["SET", "PREVIOUS", "KG", "REPS", ""].map(h => (
                <div key={h} style={{ fontFamily: SANS, fontSize: 10, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: h === "KG" || h === "REPS" ? "center" : "left" }}>{h}</div>
              ))}
            </div>

            {ex.sets.map((set, si) => (
              <div key={si} style={{
                display: "grid", gridTemplateColumns: "44px 1fr 80px 80px 44px",
                padding: "6px 18px", gap: 8, alignItems: "center",
                background: set.done ? "rgba(30,155,204,0.06)" : "transparent",
                borderTop: `1px solid ${C.border}`,
              }}>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: set.done ? C.accentBright : C.textSub }}>{set.no}</div>
                <div style={{ fontFamily: SANS, fontSize: 12, color: C.textDim }}>—</div>
                <input type="number" value={set.kg} onChange={e => updateSet(ei, si, "kg", e.target.value)}
                  style={{ background: C.surface, border: `1px solid ${set.done ? C.accent : C.border}`, borderRadius: 6, padding: "6px", color: C.text, textAlign: "center", width: "100%" }}
                />
                <input type="number" value={set.reps} onChange={e => updateSet(ei, si, "reps", e.target.value)}
                  style={{ background: C.surface, border: `1px solid ${set.done ? C.accent : C.border}`, borderRadius: 6, padding: "6px", color: C.text, textAlign: "center", width: "100%" }}
                />
                <button onClick={() => toggleDone(ei, si)} style={{
                  width: 28, height: 28, borderRadius: 6, border: `1.5px solid ${set.done ? C.accent : C.borderMid}`,
                  background: set.done ? C.accent : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyCenter: "center"
                }}>
                  {set.done && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>}
                </button>
              </div>
            ))}

            <button onClick={() => addSet(ei)} style={{ width: "100%", background: "none", border: "none", borderTop: `1px solid ${C.border}`, color: C.textSub, padding: "12px", cursor: "pointer" }}>
              + Add Set
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
        <Btn onClick={() => setShowPicker(true)}>+ Add Exercise</Btn>
        <Btn variant="danger" onClick={onDiscard}>Discard Workout</Btn>
      </div>
    </div>
  );
}