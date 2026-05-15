import { useState, useEffect, useCallback } from 'react'; 
import { C, SANS } from '../utils/theme';
import { fmtDate, fmtDuration } from '../utils/formatters';
import { StatPill } from '../components/shared/StatPill';
import { workoutService } from '../service/api';

export default function Home() {
  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState({ count: 0, volume: 0, time: "0h", records: 0 });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ id: null, name: "" });

  // Use useCallback to make the fetch function reusable and stable
  const loadData = useCallback(async (userId) => {
    try {
      setLoading(true);
      const [historyRes, summaryRes] = await Promise.all([
        workoutService.getHistory(userId),
        workoutService.getWeeklySummary(userId)
      ]);
      setSessions(historyRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedId = localStorage.getItem('user_id');
    const savedName = localStorage.getItem('username');
    
    if (savedId) {
      setUser({ id: savedId, name: savedName });
      loadData(savedId); // Load data immediately once ID is found
    } else {
      setLoading(false); // Stop loading if no user is found (redirect to login perhaps?)
    }
  }, [loadData]);

  if (loading) return <div style={{ color: C.text, padding: 40, fontFamily: SANS }}>Loading...</div>;

  const last = sessions[0];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{ fontFamily: SANS, fontSize: 22, fontWeight: 600, color: C.text, margin: 0 }}>
        Welcome, <span style={{ color: C.accentBright }}>{user.name || 'Guest'}</span>!
      </h2>

      {/* Weekly Report Section */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px" }}>
        <div style={{ fontFamily: SANS, fontSize: 12, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Weekly Report</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {[
            { label: "Sessions", value: summary.count },
            { label: "Total Volume", value: `${((summary.volume || 0) / 1000).toFixed(1)}t` },
            { label: "Time", value: summary.time },
            { label: "Records", value: `${summary.records} 🏅` },
          ].map(s => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: 11, color: C.textSub, fontFamily: SANS, marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: SANS }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Workout Summary Section */}
      {last && (
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"22px 24px"}}>
          <div style={{fontFamily:SANS,fontSize:12,color:C.textSub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16}}>Last Workout Summary</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div>
              <div style={{fontSize:17,fontWeight:600,color:C.text,fontFamily:SANS,marginBottom:4}}>{last.name}</div>
              <div style={{fontSize:12,color:C.textSub,fontFamily:SANS}}>{fmtDate(last.date)}</div>
            </div>
          </div>
          <div style={{display:"flex",gap:28,paddingBottom:16,borderBottom:`1px solid ${C.border}`,marginBottom:16}}>
            <StatPill label="Time" value={fmtDuration(last.duration)}/>
            <StatPill label="Volume" value={`${(last.volume || 0).toLocaleString()} kg`}/>
            <StatPill label="Sets" value={last.exercises?.reduce((a,e)=>a+e.sets.length,0) || 0}/>
          </div>
          {last.exercises?.slice(0,3).map(ex=>(
            <div key={ex.id} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:C.surface,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.5" strokeLinecap="round"><path d="M6 5v14M18 5v14M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/></svg>
              </div>
              <div style={{fontFamily:SANS,fontSize:13,color:C.text}}>{ex.sets.length} sets {ex.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}