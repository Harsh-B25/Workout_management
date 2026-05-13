import { useState, useEffect } from 'react';
import { C, SANS } from '../utils/theme';
import { fmtDate, fmtDuration } from '../utils/formatters';
import { StatPill } from '../components/shared/StatPill';
import { Divider } from '../components/shared/Divider';
import { workoutService } from '../service/api';

export default function History({ onSelect }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem('username') || 'User';

  useEffect(() => {
    async function loadHistory() {
      const userId = localStorage.getItem('user_id');
      try {
        const res = await workoutService.getHistory(userId);
        setSessions(res.data);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  if (loading) return <div style={{ color: C.text, padding: 40, fontFamily: SANS }}>Loading history...</div>;

  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"36px 28px",display:"flex",flexDirection:"column",gap:12}}>
      <h2 style={{fontFamily:SANS,fontSize:20,fontWeight:600,color:C.text,margin:"0 0 8px"}}>Workout History</h2>
      {sessions.map(s=>(
        <div key={s.id} onClick={()=>onSelect(s.id)} style={{
          background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 22px",cursor:"pointer",transition:"all 0.15s",
        }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderMid;e.currentTarget.style.background=C.cardHover;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card;}}
        >
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},#0e7fb3)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0  }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <div style={{fontFamily:SANS,fontSize:12,fontWeight:500,color:C.text}}>{username}</div>
              <div style={{fontFamily:SANS,fontSize:11,color:C.textSub}}>{fmtDate(s.date)} · {s.time}</div>
            </div>
          </div>
          <div style={{fontFamily:SANS,fontSize:16,fontWeight:600,color:C.text,marginBottom:10}}>{s.name}</div>
          <div style={{display:"flex",gap:24,marginBottom:12}}>
            <StatPill label="Time" value={fmtDuration(s.duration)}/>
            <StatPill label="Volume" value={`${(s.volume || 0).toLocaleString()} kg`}/>
          </div>
          <Divider/>
          <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
            {s.exercises.slice(0,3).map(ex=>(
              <div key={ex.id} style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:34,height:34,borderRadius:"50%",background:C.surface,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.5" strokeLinecap="round"><path d="M6 5v14M18 5v14M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/></svg>
                </div>
                <span style={{fontFamily:SANS,fontSize:13,color:C.text}}>{ex.sets.length} sets {ex.name}</span>
              </div>
            ))}
            {s.exercises.length>3 && (
              <div style={{fontFamily:SANS,fontSize:12,color:C.textSub,textAlign:"center",marginTop:4}}>See {s.exercises.length-3} more exercises</div>
            )}
          </div>
          {/* Like / comment / share */}
          <div style={{display:"flex",gap:20,marginTop:14,paddingTop:12,borderTop:`1px solid ${C.border}`}}>
            {[
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.8" strokeLinecap="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.8" strokeLinecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>,
            ].map((icon,i)=>(
              <button key={i} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:C.textSub,fontFamily:SANS,fontSize:12}}>{icon}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}