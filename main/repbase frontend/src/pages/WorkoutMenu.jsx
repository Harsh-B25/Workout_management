import { C, SANS } from '../utils/theme';
import { Btn } from '../components/shared/Btn';

export default function WorkoutMenu({ onStartWorkout, onStartRoutine, routines }) {
  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"36px 28px",display:"flex",flexDirection:"column",gap:20}}>
      {/* Start empty */}
      <button onClick={onStartWorkout} style={{
        background:C.card,border:`1px solid ${C.border}`,borderRadius:12,
        padding:"18px 24px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,
        transition:"all 0.15s",
      }}
        onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderMid}
        onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}
      >
        <div style={{width:32,height:32,borderRadius:8,background:C.accentDim,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.accentBright} strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </div>
        <span style={{fontFamily:SANS,fontSize:14,fontWeight:500,color:C.text}}>Start Empty Workout</span>
      </button>

      {/* Routines header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontFamily:SANS,fontSize:15,fontWeight:600,color:C.text}}>Routines</span>
        <div style={{display:"flex",gap:8}}>
          <Btn variant="ghost" style={{padding:"6px 14px",fontSize:12}}>New Routine</Btn>
          <Btn variant="ghost" style={{padding:"6px 14px",fontSize:12}}>Explore</Btn>
        </div>
      </div>

      {/* My Routines */}
      <div>
        <div style={{display:"flex",alignItems:"center",gap:6, marginBottom: 10}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill={C.textSub} stroke="none"><path d="M7 10l5 5 5-5z"/></svg>
          <span style={{fontFamily:SANS,fontSize:12,color:C.textSub}}>My Routines ({routines.length})</span>
        </div>
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
            {routines.map(r=>(
              <div key={r.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px", display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
                <div>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                      <span style={{fontFamily:SANS,fontSize:15,fontWeight:600,color:C.text}}>{r.name}</span>
                      <button style={{background:"none",border:"none",cursor:"pointer",color:C.textSub,fontSize:18,lineHeight:1}}>⋯</button>
                    </div>
                    <div style={{fontFamily:SANS,fontSize:12,color:C.textSub,marginBottom:14,lineHeight:1.5}}>{r.desc}</div>
                </div>
                <button onClick={()=>onStartRoutine(r)} style={{
                  width:"100%",background:C.accent,border:"none",borderRadius:8,
                  padding:"10px",color:"#fff",fontSize:13,fontWeight:600,fontFamily:SANS,cursor:"pointer",
                  transition:"background 0.15s",
                  marginTop: 14
                }}
                  onMouseEnter={e=>e.currentTarget.style.background=C.accentBright}
                  onMouseLeave={e=>e.currentTarget.style.background=C.accent}
                >Start Routine</button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}