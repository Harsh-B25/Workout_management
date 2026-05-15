import { useState, useEffect } from 'react';
import { C, SANS } from '../utils/theme';
import { fmtDate, fmtDuration, muscleSplit } from '../utils/formatters';
import { StatPill } from '../components/shared/StatPill';
import { EXERCISES_DB } from '../utils/constants';
import { workoutService } from '../service/api';


export default function WorkoutDetail({ sessionId, onBack }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem('username') || 'User';
  const userId = localStorage.getItem('user_id');

  const [showAllMuscles, setShowAllMuscles] = useState(false);

    useEffect(() => {
      async function loadDetail() {
        try {
          const res = await workoutService.getDetail(sessionId , userId);
          setSession(res.data);
        } catch (err) {
          console.error("Error fetching workout detail", err);
        } finally {
          setLoading(false);
        }
      }
      loadDetail();
    }, [sessionId]);

    if (loading) return <div style={{ color: C.text, padding: 40 }}>Loading details...</div>;
    if (!session) return <div style={{ color: C.text, padding: 40 }}>Workout not found.</div>;

    // Now it's safe to run this because session is guaranteed to exist
  const split = muscleSplit(session, EXERCISES_DB);
  const displayed = showAllMuscles ? split : split.slice(0, 3);
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 28px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", color: C.textSub, fontFamily: SANS, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, marginBottom: 20, padding: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
        Workout Detail
      </button>

      {/* Header */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent},#0e7fb3)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
          </div>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: C.text }}>cps009</div>
            <div style={{ fontFamily: SANS, fontSize: 11, color: C.textSub }}>{fmtDate(session.date)} · {session.time}</div>
          </div>
        </div>
        <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 12 }}>{session.name}</div>
        <div style={{ display: "flex", gap: 28, paddingBottom: 14, borderBottom: `1px solid ${C.border}`, marginBottom: 14 }}>
          <StatPill label="Time" value={fmtDuration(session.duration)} />
          <StatPill label="Volume" value={`${session.volume.toLocaleString()} kg`} />
          <StatPill label="Sets" value={session.exercises.reduce((a, e) => a + e.sets.length, 0)} />
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.8" strokeLinecap="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>, label: "3" },
            { icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>, label: "" },
            { icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.8" strokeLinecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>, label: "" },
          ].map((btn, i) => (
            <button key={i} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: C.textSub, fontFamily: SANS, fontSize: 12 }}>{btn.icon}{btn.label}</button>
          ))}
        </div>
      </div>

      {/* Muscle split */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", marginBottom: 16 }}>
        <div style={{ fontFamily: SANS, fontSize: 12, color: C.textSub, marginBottom: 14 }}>Muscle Split</div>
        {displayed.map(({ muscle, pct }) => (
          <div key={muscle} style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 5 }}>{muscle}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, height: 7, background: C.surface, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: C.accent, borderRadius: 4, transition: "width 0.4s" }} />
              </div>
              <span style={{ fontFamily: SANS, fontSize: 12, color: C.textSub, minWidth: 34, textAlign: "right" }}>{pct}%</span>
            </div>
          </div>
        ))}
        {split.length > 3 && (
          <button onClick={() => setShowAllMuscles(s => !s)} style={{ background: "none", border: "none", color: C.accentBright, fontFamily: SANS, fontSize: 13, cursor: "pointer", padding: 0, marginTop: 4 }}>
            {showAllMuscles ? "Show less" : `Show ${split.length - 3} more`}
          </button>
        )}
      </div>

      {/* Exercises */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontFamily: SANS, fontSize: 12, color: C.textSub }}>Workout</span>
          <button style={{ background: "none", border: "none", color: C.accentBright, fontFamily: SANS, fontSize: 13, cursor: "pointer" }}>Edit Workout</button>
        </div>
        {session.exercises.map(ex => (
          <div key={ex.id} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.surface, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.accentBright} strokeWidth="1.8" strokeLinecap="round"><path d="M6 5v14M18 5v14M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12" /></svg>
              </div>
              <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.accentBright }}>{ex.name}</span>
            </div>
            {/* Sets */}
            <div style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: "2px 0" }}>
              <div style={{ fontFamily: SANS, fontSize: 10, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.06em", padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>SET</div>
              <div style={{ fontFamily: SANS, fontSize: 10, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.06em", padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>WEIGHT & REPS</div>
              {ex.sets.map((set, si) => (
                <>
                  <div key={`l${si}`} style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: typeof set.no === "string" ? C.amber : C.textSub, padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>{set.no}</div>
                  <div key={`v${si}`} style={{ fontFamily: SANS, fontSize: 14, color: C.text, padding: "9px 0", borderBottom: `1px solid ${C.border}` }}>{set.weight} kg × {set.reps}</div>
                </>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}