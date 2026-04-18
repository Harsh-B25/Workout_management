import { useState, useEffect, useRef } from "react";

// ─── DESIGN TOKENS (from Figma + Hevy reference) ──────────────────────────────
const C = {
  bg:          "#0d0f10",
  surface:     "#141618",
  card:        "#1a1d1f",
  cardHover:   "#1f2224",
  border:      "#252829",
  borderMid:   "#2e3235",
  accent:      "#1e9bcc",   // teal/cyan from Figma
  accentBright:"#2db8ef",
  accentDim:   "rgba(30,155,204,0.12)",
  accentText:  "#4fc3f7",
  red:         "#ef5350",
  redDim:      "rgba(239,83,80,0.12)",
  green:       "#66bb6a",
  amber:       "#ffa726",
  text:        "#f0f2f4",
  textSub:     "#8a9099",
  textDim:     "#4a5058",
  white:       "#ffffff",
};

const SANS = "'Inter', 'Helvetica Neue', Arial, sans-serif";

// ─── SEED DATA ─────────────────────────────────────────────────────────────────
const EXERCISES_DB = [
  { id:1,  name:"Bench Press",           equipment:"Barbell",    type:"Strength", muscles:["Chest","Triceps"] },
  { id:2,  name:"Squat",                 equipment:"Barbell",    type:"Strength", muscles:["Quads","Glutes"] },
  { id:3,  name:"Deadlift",             equipment:"Barbell",    type:"Strength", muscles:["Back","Hamstrings"] },
  { id:4,  name:"Pull-Up",              equipment:"Bodyweight", type:"Strength", muscles:["Back","Biceps"] },
  { id:5,  name:"Overhead Press",       equipment:"Barbell",    type:"Strength", muscles:["Shoulders","Triceps"] },
  { id:6,  name:"Sumo Squat",           equipment:"Barbell",    type:"Strength", muscles:["Quads","Glutes"] },
  { id:7,  name:"Incline Bench Press",  equipment:"Barbell",    type:"Strength", muscles:["Chest","Shoulders"] },
  { id:8,  name:"Lat Pulldown",         equipment:"Cable",      type:"Strength", muscles:["Back","Biceps"] },
  { id:9,  name:"Leg Press",            equipment:"Machine",    type:"Strength", muscles:["Quads","Glutes"] },
  { id:10, name:"Bicep Curl",           equipment:"Barbell",    type:"Strength", muscles:["Biceps"] },
  { id:11, name:"Triceps Rope Pushdown",equipment:"Cable",      type:"Strength", muscles:["Triceps"] },
  { id:12, name:"Romanian Deadlift",    equipment:"Barbell",    type:"Strength", muscles:["Hamstrings","Glutes"] },
  { id:13, name:"Seated Cable Row",     equipment:"Cable",      type:"Strength", muscles:["Back","Biceps"] },
  { id:14, name:"Face Pull",            equipment:"Cable",      type:"Strength", muscles:["Shoulders"] },
  { id:15, name:"Plank",               equipment:"Bodyweight", type:"Strength", muscles:["Abs"] },
  { id:16, name:"Chest Fly",           equipment:"Machine",    type:"Strength", muscles:["Chest"] },
  { id:17, name:"Lateral Raise",       equipment:"Dumbbell",   type:"Strength", muscles:["Shoulders"] },
  { id:18, name:"Treadmill",           equipment:"Machine",    type:"Cardio",   muscles:["Cardio"] },
];

const ROUTINES = [
  { id:1, name:"Chest + Tricep",   exercises:[1,7,16,11], desc:"Push Up, Bench Press (Barbell), Chest Fly (Machine), Incline Bench Press (Barbell)..." },
  { id:2, name:"Back + Bicep",     exercises:[3,4,8,13,10], desc:"Deadlift, Pull-Up, Lat Pulldown (Cable), Seated Cable Row, Bicep Curl..." },
  { id:3, name:"Shoulder + Core",  exercises:[5,14,17,15], desc:"Overhead Press, Face Pull (Cable), Lateral Raise, Plank..." },
  { id:4, name:"Leg day",          exercises:[2,6,9,12],  desc:"Squat, Sumo Squat (Barbell), Leg Press (Machine), Romanian Deadlift..." },
];

const WORKOUT_HISTORY = [
  {
    id:1, name:"Evening workout", date:"2026-03-12", time:"5:23pm", duration:94, volume:10550,
    exercises:[
      { id:5,  name:"Overhead Press (Smith Machine)", sets:[{no:"W",kg:10,reps:15},{no:1,kg:40,reps:10},{no:2,kg:50,reps:8},{no:3,kg:55,reps:6}] },
      { id:14, name:"Face Pull", sets:[{no:1,kg:25,reps:15},{no:2,kg:30,reps:12}] },
      { id:17, name:"Lateral Raise", sets:[{no:1,kg:12,reps:15},{no:2,kg:14,reps:12},{no:3,kg:16,reps:10}] },
    ]
  },
  {
    id:2, name:"Afternoon workout", date:"2026-03-11", time:"2:14pm", duration:85, volume:12860,
    exercises:[
      { id:6,  name:"Sumo Squat (Barbell)",  sets:[{no:1,kg:80,reps:8},{no:2,kg:85,reps:6}] },
      { id:2,  name:"Squat (Barbell)",       sets:[{no:1,kg:100,reps:5},{no:2,kg:105,reps:5}] },
      { id:9,  name:"Leg Press (Machine)",   sets:[{no:1,kg:150,reps:10},{no:2,kg:160,reps:10},{no:3,kg:170,reps:8}] },
    ]
  },
  {
    id:3, name:"Evening workout", date:"2026-03-10", time:"5:23pm", duration:60, volume:6530,
    exercises:[
      { id:1,  name:"Bench Press (Barbell)",       sets:[{no:"W",kg:20,reps:15},{no:1,kg:40,reps:8},{no:2,kg:40,reps:12},{no:3,kg:45,reps:10},{no:4,kg:45,reps:8}] },
      { id:16, name:"Chest Fly (Machine)",         sets:[{no:1,kg:35,reps:15},{no:2,kg:40,reps:12},{no:3,kg:42,reps:10}] },
      { id:11, name:"Triceps Rope Pushdown",       sets:[{no:1,kg:25,reps:15},{no:2,kg:27,reps:12},{no:3,kg:30,reps:10}] },
    ]
  },
];

const CHART_DATA = [
  { label:"Dec 21", hrs:2.5 }, { label:"Dec 28", hrs:1 }, { label:"Jan 4", hrs:4 },
  { label:"Jan 11", hrs:3 },   { label:"Jan 18", hrs:8.5 }, { label:"Jan 25", hrs:8 },
  { label:"Feb 1",  hrs:4.5 }, { label:"Feb 8",  hrs:4 },  { label:"Feb 15", hrs:4.5 },
  { label:"Feb 22", hrs:4 },   { label:"Mar 1",  hrs:5.5 }, { label:"Mar 8",  hrs:2.5 },
  { label:"Mar 13", hrs:4.5 },
];

const MUSCLE_GROUPS = ["All","Chest","Back","Shoulders","Biceps","Triceps","Abs","Quads","Hamstrings","Glutes","Cardio"];

// ─── HELPERS ───────────────────────────────────────────────────────────────────
function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric",year:"numeric"});
}
function fmtShortDate(d) {
  return new Date(d).toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"});
}
function fmtDuration(m) { return `${Math.floor(m/60)}h ${m%60}min`; }
function muscleSplit(session) {
  const counts = {};
  session.exercises.forEach(ex => {
    const dbEx = EXERCISES_DB.find(e=>e.id===ex.id);
    (dbEx?.muscles||[]).forEach(m => { counts[m]=(counts[m]||0)+ex.sets.length; });
  });
  const total = Object.values(counts).reduce((a,b)=>a+b,0)||1;
  return Object.entries(counts).map(([m,c])=>({muscle:m,pct:Math.round(c/total*100)})).sort((a,b)=>b.pct-a.pct);
}

// ─── SHARED COMPONENTS ─────────────────────────────────────────────────────────
function Divider() { return <div style={{height:1,background:C.border,margin:"0"}}/>; }

function Tag({children,active,onClick}) {
  return (
    <button onClick={onClick} style={{
      background: active ? C.accentDim : "transparent",
      border: `1px solid ${active ? C.accent : C.border}`,
      color: active ? C.accentText : C.textSub,
      borderRadius:20, padding:"4px 13px", fontSize:12, cursor:"pointer", fontFamily:SANS,
      transition:"all 0.15s", whiteSpace:"nowrap",
    }}>{children}</button>
  );
}

function Btn({children,variant="primary",onClick,style={}}) {
  const styles = {
    primary:  {background:C.accent, color:"#fff", border:"none"},
    ghost:    {background:C.card, color:C.text, border:`1px solid ${C.border}`},
    danger:   {background:"transparent", color:C.red, border:`1px solid ${C.border}`},
    outline:  {background:"transparent", color:C.accent, border:`1px solid ${C.accent}`},
  };
  return (
    <button onClick={onClick} style={{
      ...styles[variant], borderRadius:8, padding:"9px 20px", fontSize:13,
      fontFamily:SANS, fontWeight:500, cursor:"pointer", transition:"all 0.15s", ...style,
    }}>{children}</button>
  );
}

function StatPill({label,value,accent}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:2}}>
      <span style={{fontSize:11,color:C.textSub,fontFamily:SANS}}>{label}</span>
      <span style={{fontSize:15,fontWeight:600,color:accent?C.accentBright:C.text,fontFamily:SANS}}>{value}</span>
    </div>
  );
}

// ─── NAVBAR ────────────────────────────────────────────────────────────────────
function NavBar({page,setPage,role,setRole}) {
  const tabs = [
    {id:"home",label:"Home"},
    {id:"membership",label:"Membership"},
    {id:"workout",label:"Workout"},
    {id:"history",label:"History"},
    {id:"profile",label:"Profile"},
    ...(role==="Admin"||role==="Dev"?[{id:"admin",label:"Admin"}]:[]),
    ...(role==="Dev"?[{id:"dev",label:"Dev"}]:[]),
  ];
  return (
    <nav style={{
      position:"sticky",top:0,zIndex:100,
      background:C.surface, borderBottom:`1px solid ${C.border}`,
      display:"flex",alignItems:"center",padding:"0 28px",height:52,gap:32,
    }}>
      {/* Logo */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginRight:8}}>
        <div style={{width:22,height:22,borderRadius:4,background:C.accent,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 5v14M18 5v14M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/>
          </svg>
        </div>
        <span style={{fontFamily:SANS,fontSize:13,fontWeight:700,color:C.text,letterSpacing:"0.05em"}}>REPBASE</span>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:2,flex:1}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setPage(t.id)} style={{
            background: page===t.id ? C.accentDim : "transparent",
            border: "none",
            color: page===t.id ? C.accentBright : C.textSub,
            borderRadius:7, padding:"5px 14px", fontSize:13, cursor:"pointer",
            fontFamily:SANS, fontWeight: page===t.id?600:400, transition:"all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Right side */}
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        {/* Bell */}
        <button style={{background:"none",border:"none",cursor:"pointer",color:C.textSub,display:"flex",alignItems:"center"}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </button>
        {/* Role selector */}
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:10,color:C.textDim,fontFamily:SANS,textTransform:"uppercase",letterSpacing:"0.05em"}}>Role</span>
          <select value={role} onChange={e=>setRole(e.target.value)} style={{
            background:C.card,color:C.text,border:`1px solid ${C.border}`,
            borderRadius:6,padding:"3px 8px",fontSize:11,fontFamily:SANS,cursor:"pointer",
          }}>
            {["Member","Admin","Dev"].map(r=><option key={r}>{r}</option>)}
          </select>
        </div>
        {/* Avatar */}
        <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},#0e7fb3)`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      </div>
    </nav>
  );
}

// ─── HOME PAGE ──────────────────────────────────────────────────────────────────
function HomePage({sessions}) {
  const last = sessions[0];
  const thisWeekVol = sessions.slice(0,3).reduce((a,s)=>a+s.volume,0);
  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"36px 28px",display:"flex",flexDirection:"column",gap:20}}>
      <h2 style={{fontFamily:SANS,fontSize:22,fontWeight:600,color:C.text,margin:0}}>
        Welcome, <span style={{color:C.accentBright}}>cps009</span>!
      </h2>

      {/* Weekly Report */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"22px 24px"}}>
        <div style={{fontFamily:SANS,fontSize:12,color:C.textSub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16}}>Weekly Report</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
          {[
            {label:"Sessions",value:sessions.slice(0,3).length},
            {label:"Total Volume",value:`${(thisWeekVol/1000).toFixed(1)}t`},
            {label:"Time",value:"5h 0min"},
            {label:"Records",value:"6 🏅"},
          ].map(s=>(
            <div key={s.label} style={{background:C.surface,borderRadius:10,padding:"14px 16px"}}>
              <div style={{fontSize:11,color:C.textSub,fontFamily:SANS,marginBottom:6}}>{s.label}</div>
              <div style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:SANS}}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Last Workout Summary */}
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
            <StatPill label="Volume" value={`${last.volume.toLocaleString()} kg`}/>
            <StatPill label="Sets" value={last.exercises.reduce((a,e)=>a+e.sets.length,0)}/>
          </div>
          {last.exercises.slice(0,3).map(ex=>(
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

// ─── WORKOUT PAGE (Routines) ───────────────────────────────────────────────────
function WorkoutPage({onStartWorkout, onStartRoutine}) {
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
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill={C.textSub} stroke="none"><path d="M7 10l5 5 5-5z"/></svg>
          <span style={{fontFamily:SANS,fontSize:12,color:C.textSub}}>My Routines ({ROUTINES.length})</span>
        </div>
        {ROUTINES.map(r=>(
          <div key={r.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontFamily:SANS,fontSize:15,fontWeight:600,color:C.text}}>{r.name}</span>
              <button style={{background:"none",border:"none",cursor:"pointer",color:C.textSub,fontSize:18,lineHeight:1}}>⋯</button>
            </div>
            <div style={{fontFamily:SANS,fontSize:12,color:C.textSub,marginBottom:14,lineHeight:1.5}}>{r.desc}</div>
            <button onClick={()=>onStartRoutine(r)} style={{
              width:"100%",background:C.accent,border:"none",borderRadius:8,
              padding:"10px",color:"#fff",fontSize:13,fontWeight:600,fontFamily:SANS,cursor:"pointer",
              transition:"background 0.15s",
            }}
              onMouseEnter={e=>e.currentTarget.style.background=C.accentBright}
              onMouseLeave={e=>e.currentTarget.style.background=C.accent}
            >Start Routine</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EXERCISE PICKER MODAL ──────────────────────────────────────────────────────
function ExercisePicker({onSelect,onClose}) {
  const [search,setSearch] = useState("");
  const [muscle,setMuscle] = useState("All");
  const filtered = EXERCISES_DB.filter(e=>
    (muscle==="All"||e.muscles.includes(muscle)) &&
    e.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,width:500,maxHeight:"72vh",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"18px 20px 0",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontFamily:SANS,fontWeight:600,fontSize:15,color:C.text}}>Add Exercise</span>
            <button onClick={onClose} style={{background:"none",border:"none",color:C.textSub,cursor:"pointer",fontSize:22,lineHeight:1}}>×</button>
          </div>
          <input autoFocus placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)}
            style={{width:"100%",background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 14px",color:C.text,fontFamily:SANS,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:12}}
          />
          <div style={{display:"flex",gap:6,paddingBottom:14,overflowX:"auto"}}>
            {MUSCLE_GROUPS.map(m=><Tag key={m} active={muscle===m} onClick={()=>setMuscle(m)}>{m}</Tag>)}
          </div>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {filtered.map(ex=>(
            <button key={ex.id} onClick={()=>onSelect(ex)} style={{
              width:"100%",background:"none",border:"none",borderBottom:`1px solid ${C.border}`,
              padding:"13px 20px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:12,
            }}
              onMouseEnter={e=>e.currentTarget.style.background=C.card}
              onMouseLeave={e=>e.currentTarget.style.background="none"}
            >
              <div style={{width:36,height:36,borderRadius:"50%",background:C.card,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.5" strokeLinecap="round"><path d="M6 5v14M18 5v14M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/></svg>
              </div>
              <div>
                <div style={{fontFamily:SANS,fontSize:13,fontWeight:500,color:C.text}}>{ex.name}</div>
                <div style={{fontFamily:SANS,fontSize:11,color:C.textSub,marginTop:2}}>{ex.equipment} · {ex.muscles.join(", ")}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LOG WORKOUT PAGE ───────────────────────────────────────────────────────────
function LogWorkout({initialRoutine, onFinish, onDiscard}) {
  const [exs, setExs] = useState(
    initialRoutine
      ? initialRoutine.exercises.map(id=>{
          const e = EXERCISES_DB.find(x=>x.id===id);
          return {...e, sets:[{no:1,kg:0,reps:10,done:false}], notes:""};
        })
      : []
  );
  const [showPicker, setShowPicker] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [restTimer, setRestTimer] = useState(null); // null | seconds
  const timerRef = useRef();
  const restRef = useRef();

  useEffect(()=>{
    timerRef.current = setInterval(()=>setElapsed(e=>e+1),1000);
    return ()=>clearInterval(timerRef.current);
  },[]);

  useEffect(()=>{
    if(restTimer===null) return;
    if(restTimer<=0){ setRestTimer(null); return; }
    restRef.current = setTimeout(()=>setRestTimer(r=>r-1),1000);
    return()=>clearTimeout(restRef.current);
  },[restTimer]);

  const totalVol = exs.reduce((a,ex)=>a+ex.sets.filter(s=>s.done).reduce((b,s)=>b+(s.kg*s.reps),0),0);
  const totalSets = exs.reduce((a,ex)=>a+ex.sets.filter(s=>s.done).length,0);
  const fmt = s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  function addExercise(ex) { setExs(p=>[...p,{...ex,sets:[{no:1,kg:0,reps:10,done:false}],notes:""}]); setShowPicker(false); }
  function addSet(ei) { setExs(p=>p.map((ex,i)=>i!==ei?ex:{...ex,sets:[...ex.sets,{no:ex.sets.length+1,kg:ex.sets.at(-1)?.kg||0,reps:ex.sets.at(-1)?.reps||10,done:false}]})); }
  function updateSet(ei,si,field,val) { setExs(p=>p.map((ex,i)=>i!==ei?ex:{...ex,sets:ex.sets.map((s,j)=>j!==si?s:{...s,[field]:field==="done"?val:parseFloat(val)||0})})); }
  function toggleDone(ei,si) {
    updateSet(ei,si,"done",!exs[ei].sets[si].done);
    setRestTimer(180); // 3min rest
  }
  function removeSet(ei,si) { setExs(p=>p.map((ex,i)=>i!==ei?ex:{...ex,sets:ex.sets.filter((_,j)=>j!==si).map((s,j)=>({...s,no:j+1}))})); }

  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"0 28px 40px"}}>
      {showPicker && <ExercisePicker onSelect={addExercise} onClose={()=>setShowPicker(false)}/>}

      {/* Sticky header */}
      <div style={{position:"sticky",top:52,background:C.bg,zIndex:50,padding:"14px 0 10px",borderBottom:`1px solid ${C.border}`,marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={onDiscard} style={{background:"none",border:"none",cursor:"pointer",color:C.textSub}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 9l-7 7-7-7"/></svg>
            </button>
            <span style={{fontFamily:SANS,fontSize:15,fontWeight:600,color:C.text}}>Log Workout</span>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{width:32,height:32,borderRadius:"50%",border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <button onClick={()=>onFinish(exs,elapsed)} style={{
              background:C.accent,border:"none",borderRadius:8,padding:"7px 20px",
              color:"#fff",fontSize:13,fontWeight:600,fontFamily:SANS,cursor:"pointer",
            }}>Finish</button>
          </div>
        </div>
        <div style={{display:"flex",gap:28,alignItems:"center"}}>
          <StatPill label="Duration" value={<span style={{color:C.accentBright}}>{fmt(elapsed)}</span>} accent/>
          <StatPill label="Volume" value={`${totalVol.toLocaleString()} kg`}/>
          <StatPill label="Sets" value={totalSets}/>
          {/* Rest timer */}
          {restTimer!==null && (
            <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,background:C.accentDim,border:`1px solid ${C.accent}`,borderRadius:8,padding:"4px 12px"}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.accentBright} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span style={{fontFamily:SANS,fontSize:12,color:C.accentBright,fontWeight:600}}>Rest: {Math.floor(restTimer/60)}min {restTimer%60}s</span>
              <button onClick={()=>setRestTimer(null)} style={{background:"none",border:"none",color:C.textSub,cursor:"pointer",fontSize:14,lineHeight:1}}>×</button>
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {exs.length===0 && (
        <div style={{textAlign:"center",padding:"80px 0 40px"}}>
          <div style={{marginBottom:16}}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1.2" strokeLinecap="round" style={{display:"block",margin:"0 auto"}}><path d="M6 5v14M18 5v14M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/></svg>
          </div>
          <div style={{fontFamily:SANS,fontSize:16,fontWeight:600,color:C.text,marginBottom:6}}>Get started</div>
          <div style={{fontFamily:SANS,fontSize:13,color:C.textSub,marginBottom:28}}>Add an exercise to start your workout</div>
          <Btn onClick={()=>setShowPicker(true)} style={{padding:"11px 32px",fontSize:14}}>+ Add Exercise</Btn>
        </div>
      )}

      {/* Exercise cards */}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {exs.map((ex,ei)=>(
          <div key={ei} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,overflow:"hidden"}}>
            {/* Exercise header */}
            <div style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:38,height:38,borderRadius:"50%",background:C.surface,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.accentBright} strokeWidth="1.8" strokeLinecap="round"><path d="M6 5v14M18 5v14M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/></svg>
              </div>
              <span style={{fontFamily:SANS,fontSize:14,fontWeight:600,color:C.accentBright,flex:1}}>{ex.name}</span>
              <button style={{background:"none",border:"none",color:C.textSub,cursor:"pointer",fontSize:18,lineHeight:1}}>⋯</button>
            </div>

            {/* Notes */}
            <div style={{padding:"0 18px 10px"}}>
              <input placeholder="Add notes here..." style={{
                width:"100%",background:"none",border:"none",color:C.textSub,fontFamily:SANS,
                fontSize:12,outline:"none",boxSizing:"border-box",
              }}/>
              <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.accentBright} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span style={{fontFamily:SANS,fontSize:12,color:C.accentBright}}>Rest Timer: 3min 0s</span>
              </div>
            </div>

            <Divider/>

            {/* Set table header */}
            <div style={{display:"grid",gridTemplateColumns:"44px 1fr 80px 80px 44px",padding:"8px 18px",gap:8}}>
              {["SET","PREVIOUS","KG","REPS",""].map(h=>(
                <div key={h} style={{fontFamily:SANS,fontSize:10,color:C.textSub,textTransform:"uppercase",letterSpacing:"0.06em",textAlign:h==="KG"||h==="REPS"?"center":"left"}}>{h}</div>
              ))}
            </div>

            {/* Sets */}
            {ex.sets.map((set,si)=>{
              const done = set.done;
              return (
                <div key={si} style={{
                  display:"grid",gridTemplateColumns:"44px 1fr 80px 80px 44px",
                  padding:"6px 18px",gap:8,alignItems:"center",
                  background: done ? "rgba(30,155,204,0.06)" : "transparent",
                  borderTop:`1px solid ${C.border}`,
                }}>
                  {/* Set label */}
                  <div style={{fontFamily:SANS,fontSize:13,fontWeight:700,color:done?C.accentBright:C.textSub,textAlign:"left"}}>
                    {set.no==="W"||set.no==="D" ? <span style={{color:set.no==="D"?C.accentBright:C.amber}}>{set.no}</span> : set.no}
                  </div>
                  {/* Previous */}
                  <div style={{fontFamily:SANS,fontSize:12,color:C.textDim}}>{si>0?`${ex.sets[si-1].kg}kg × ${ex.sets[si-1].reps}`:"—"}</div>
                  {/* KG */}
                  <input type="number" min="0" step="0.5" value={set.kg} onChange={e=>updateSet(ei,si,"kg",e.target.value)}
                    style={{background:done?"rgba(30,155,204,0.1)":C.surface,border:`1px solid ${done?C.accent:C.border}`,borderRadius:6,padding:"6px",color:C.text,fontFamily:SANS,fontSize:13,fontWeight:600,textAlign:"center",width:"100%",boxSizing:"border-box",outline:"none"}}
                  />
                  {/* Reps */}
                  <input type="number" min="0" value={set.reps} onChange={e=>updateSet(ei,si,"reps",e.target.value)}
                    style={{background:done?"rgba(30,155,204,0.1)":C.surface,border:`1px solid ${done?C.accent:C.border}`,borderRadius:6,padding:"6px",color:C.text,fontFamily:SANS,fontSize:13,fontWeight:600,textAlign:"center",width:"100%",boxSizing:"border-box",outline:"none"}}
                  />
                  {/* Check */}
                  <button onClick={()=>toggleDone(ei,si)} style={{
                    width:28,height:28,borderRadius:6,border:`1.5px solid ${done?C.accent:C.borderMid}`,
                    background:done?C.accent:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                  }}>
                    {done && <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                  </button>
                </div>
              );
            })}

            {/* Add Set */}
            <button onClick={()=>addSet(ei)} style={{
              width:"100%",background:"none",border:"none",borderTop:`1px solid ${C.border}`,
              color:C.textSub,fontFamily:SANS,fontSize:13,cursor:"pointer",padding:"12px",
              display:"flex",alignItems:"center",justifyContent:"center",gap:6,
            }}
              onMouseEnter={e=>e.currentTarget.style.background=C.cardHover}
              onMouseLeave={e=>e.currentTarget.style.background="none"}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Add Set
            </button>
          </div>
        ))}
      </div>

      {/* Bottom controls */}
      {exs.length>0 && (
        <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:16}}>
          <button onClick={()=>setShowPicker(true)} style={{
            width:"100%",background:C.accent,border:"none",borderRadius:10,
            padding:"12px",color:"#fff",fontSize:14,fontWeight:600,fontFamily:SANS,cursor:"pointer",
          }}>+ Add Exercise</button>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            <Btn variant="ghost" style={{width:"100%",textAlign:"center"}}>Settings</Btn>
            <Btn variant="danger" onClick={onDiscard} style={{width:"100%",textAlign:"center"}}>Discard Workout</Btn>
          </div>
        </div>
      )}
      {exs.length===0 && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
          <Btn variant="ghost" style={{textAlign:"center"}}>Settings</Btn>
          <Btn variant="danger" onClick={onDiscard} style={{textAlign:"center"}}>Discard Workout</Btn>
        </div>
      )}
    </div>
  );
}

// ─── HISTORY PAGE ──────────────────────────────────────────────────────────────
function HistoryPage({sessions,onSelect}) {
  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"36px 28px",display:"flex",flexDirection:"column",gap:12}}>
      <h2 style={{fontFamily:SANS,fontSize:20,fontWeight:600,color:C.text,margin:"0 0 8px"}}>Workout History</h2>
      {sessions.map(s=>(
        <div key={s.id} onClick={()=>onSelect(s)} style={{
          background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 22px",cursor:"pointer",transition:"all 0.15s",
        }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=C.borderMid;e.currentTarget.style.background=C.cardHover;}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.card;}}
        >
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},#0e7fb3)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <div style={{fontFamily:SANS,fontSize:12,fontWeight:500,color:C.text}}>cps009</div>
              <div style={{fontFamily:SANS,fontSize:11,color:C.textSub}}>{fmtDate(s.date)} · {s.time}</div>
            </div>
            <button style={{marginLeft:"auto",background:"none",border:"none",color:C.textSub,cursor:"pointer",fontSize:18}}>⋯</button>
          </div>
          <div style={{fontFamily:SANS,fontSize:16,fontWeight:600,color:C.text,marginBottom:10}}>{s.name}</div>
          <div style={{display:"flex",gap:24,marginBottom:12}}>
            <StatPill label="Time" value={fmtDuration(s.duration)}/>
            <StatPill label="Volume" value={`${s.volume.toLocaleString()} kg`}/>
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

// ─── WORKOUT DETAIL ─────────────────────────────────────────────────────────────
function WorkoutDetail({session,onBack}) {
  const [showAllMuscles,setShowAllMuscles] = useState(false);
  const split = muscleSplit(session);
  const displayed = showAllMuscles ? split : split.slice(0,3);

  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"36px 28px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.textSub,fontFamily:SANS,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:20,padding:0}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
        Workout Detail
      </button>

      {/* Header */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"22px 24px",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{width:40,height:40,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},#0e7fb3)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <div style={{fontFamily:SANS,fontSize:13,fontWeight:500,color:C.text}}>cps009</div>
            <div style={{fontFamily:SANS,fontSize:11,color:C.textSub}}>{fmtDate(session.date)} · {session.time}</div>
          </div>
        </div>
        <div style={{fontFamily:SANS,fontSize:18,fontWeight:700,color:C.text,marginBottom:12}}>{session.name}</div>
        <div style={{display:"flex",gap:28,paddingBottom:14,borderBottom:`1px solid ${C.border}`,marginBottom:14}}>
          <StatPill label="Time" value={fmtDuration(session.duration)}/>
          <StatPill label="Volume" value={`${session.volume.toLocaleString()} kg`}/>
          <StatPill label="Sets" value={session.exercises.reduce((a,e)=>a+e.sets.length,0)}/>
        </div>
        <div style={{display:"flex",gap:20}}>
          {[
            {icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.8" strokeLinecap="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>, label:"3"},
            {icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, label:""},
            {icon:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.8" strokeLinecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>, label:""},
          ].map((btn,i)=>(
            <button key={i} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:5,color:C.textSub,fontFamily:SANS,fontSize:12}}>{btn.icon}{btn.label}</button>
          ))}
        </div>
      </div>

      {/* Muscle split */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px 24px",marginBottom:16}}>
        <div style={{fontFamily:SANS,fontSize:12,color:C.textSub,marginBottom:14}}>Muscle Split</div>
        {displayed.map(({muscle,pct})=>(
          <div key={muscle} style={{marginBottom:12}}>
            <div style={{fontFamily:SANS,fontSize:13,fontWeight:500,color:C.text,marginBottom:5}}>{muscle}</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{flex:1,height:7,background:C.surface,borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${pct}%`,background:C.accent,borderRadius:4,transition:"width 0.4s"}}/>
              </div>
              <span style={{fontFamily:SANS,fontSize:12,color:C.textSub,minWidth:34,textAlign:"right"}}>{pct}%</span>
            </div>
          </div>
        ))}
        {split.length>3 && (
          <button onClick={()=>setShowAllMuscles(s=>!s)} style={{background:"none",border:"none",color:C.accentBright,fontFamily:SANS,fontSize:13,cursor:"pointer",padding:0,marginTop:4}}>
            {showAllMuscles?"Show less":`Show ${split.length-3} more`}
          </button>
        )}
      </div>

      {/* Exercises */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <span style={{fontFamily:SANS,fontSize:12,color:C.textSub}}>Workout</span>
          <button style={{background:"none",border:"none",color:C.accentBright,fontFamily:SANS,fontSize:13,cursor:"pointer"}}>Edit Workout</button>
        </div>
        {session.exercises.map(ex=>(
          <div key={ex.id} style={{marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <div style={{width:38,height:38,borderRadius:"50%",background:C.surface,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.accentBright} strokeWidth="1.8" strokeLinecap="round"><path d="M6 5v14M18 5v14M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/></svg>
              </div>
              <span style={{fontFamily:SANS,fontSize:14,fontWeight:600,color:C.accentBright}}>{ex.name}</span>
            </div>
            {/* Sets */}
            <div style={{display:"grid",gridTemplateColumns:"44px 1fr",gap:"2px 0"}}>
              <div style={{fontFamily:SANS,fontSize:10,color:C.textSub,textTransform:"uppercase",letterSpacing:"0.06em",padding:"4px 0",borderBottom:`1px solid ${C.border}`}}>SET</div>
              <div style={{fontFamily:SANS,fontSize:10,color:C.textSub,textTransform:"uppercase",letterSpacing:"0.06em",padding:"4px 0",borderBottom:`1px solid ${C.border}`}}>WEIGHT & REPS</div>
              {ex.sets.map((set,si)=>(
                <>
                  <div key={`l${si}`} style={{fontFamily:SANS,fontSize:14,fontWeight:600,color:typeof set.no==="string"?C.amber:C.textSub,padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>{set.no}</div>
                  <div key={`v${si}`} style={{fontFamily:SANS,fontSize:14,color:C.text,padding:"9px 0",borderBottom:`1px solid ${C.border}`}}>{set.kg} kg × {set.reps}</div>
                </>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MEMBERSHIP PAGE ───────────────────────────────────────────────────────────
function MembershipPage() {
  const plans = [
    {name:"Monthly",duration:"1 Month",price:"₹999",access:"Basic",popular:false},
    {name:"Quarterly",duration:"3 Months",price:"₹2,499",access:"Standard",popular:true},
    {name:"Semi-Annual",duration:"6 Months",price:"₹4,499",access:"Premium",popular:false},
    {name:"Annual",duration:"12 Months",price:"₹7,999",access:"Premium+",popular:false},
  ];
  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"36px 28px",display:"flex",flexDirection:"column",gap:20}}>
      {/* Current membership */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"22px 24px"}}>
        <div style={{fontFamily:SANS,fontSize:12,color:C.textSub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:16}}>Current membership details</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
          {[
            {label:"Plan",value:"Quarterly"},
            {label:"Status",value:"Active",accent:true},
            {label:"Expires",value:"Jun 13, 2026"},
            {label:"Gym",value:"IronCore Central"},
            {label:"Access",value:"Standard"},
            {label:"Days Left",value:"92"},
          ].map(s=>(
            <div key={s.label} style={{background:C.surface,borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontFamily:SANS,fontSize:11,color:C.textSub,marginBottom:4}}>{s.label}</div>
              <div style={{fontFamily:SANS,fontSize:15,fontWeight:600,color:s.accent?C.green:C.text}}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Plans catalog */}
      <div>
        <div style={{fontFamily:SANS,fontSize:12,color:C.textSub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:14}}>Membership plans catalog</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
          {plans.map(p=>(
            <div key={p.name} style={{
              background:C.card,border:`1px solid ${p.popular?C.accent:C.border}`,
              borderRadius:12,padding:"18px 16px",position:"relative",
            }}>
              {p.popular && <div style={{position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",background:C.accent,color:"#fff",fontSize:10,fontWeight:700,fontFamily:SANS,padding:"3px 10px",borderRadius:20,whiteSpace:"nowrap"}}>Most Popular</div>}
              <div style={{fontFamily:SANS,fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>{p.name}</div>
              <div style={{fontFamily:SANS,fontSize:11,color:C.textSub,marginBottom:12}}>{p.duration}</div>
              <div style={{fontFamily:SANS,fontSize:22,fontWeight:700,color:p.popular?C.accentBright:C.text,marginBottom:4}}>{p.price}</div>
              <div style={{fontFamily:SANS,fontSize:11,color:C.textSub,marginBottom:16}}>{p.access} Access</div>
              <Btn variant={p.popular?"primary":"ghost"} style={{width:"100%",textAlign:"center",padding:"8px",fontSize:12}}>Select</Btn>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE PAGE ──────────────────────────────────────────────────────────────
function ProfilePage({sessions}) {
  const [chartMode,setChartMode] = useState("Duration");
  const maxHrs = Math.max(...CHART_DATA.map(d=>d.hrs));

  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"36px 28px",display:"flex",flexDirection:"column",gap:20}}>
      {/* Profile header */}
      <div style={{display:"flex",alignItems:"flex-start",gap:16}}>
        <div style={{width:68,height:68,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},#0e7fb3)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:SANS,fontSize:18,fontWeight:700,color:C.text,marginBottom:10}}>cps009</div>
          <div style={{display:"flex",gap:28}}>
            {[{label:"Workouts",value:108},{label:"Followers",value:7},{label:"Following",value:7}].map(s=>(
              <div key={s.label}>
                <div style={{fontFamily:SANS,fontSize:11,color:C.textSub}}>{s.label}</div>
                <div style={{fontFamily:SANS,fontSize:17,fontWeight:700,color:C.text}}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button style={{background:"none",border:"none",cursor:"pointer",color:C.textSub}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button style={{background:"none",border:"none",cursor:"pointer",color:C.textSub}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg></button>
          <button style={{background:"none",border:"none",cursor:"pointer",color:C.textSub}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
        </div>
      </div>

      {/* Chart */}
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div>
            <span style={{fontFamily:SANS,fontSize:18,fontWeight:700,color:C.text}}>5 hours</span>
            <span style={{fontFamily:SANS,fontSize:14,color:C.textSub,marginLeft:6}}>this week</span>
          </div>
          <button style={{background:"none",border:"none",color:C.accentBright,fontFamily:SANS,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
            Last 3 months
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 9l-7 7-7-7"/></svg>
          </button>
        </div>
        {/* Bar chart */}
        <div style={{display:"flex",alignItems:"flex-end",gap:3,height:100,marginBottom:8,marginTop:16,paddingLeft:32,position:"relative"}}>
          {/* Y axis */}
          {[0,3,6,9].map(v=>(
            <div key={v} style={{position:"absolute",left:0,bottom:`${(v/10)*100}%`,fontFamily:SANS,fontSize:10,color:C.textDim,lineHeight:1}}>{v} hrs</div>
          ))}
          {CHART_DATA.map((d,i)=>(
            <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{width:"100%",background:C.accent,borderRadius:"3px 3px 0 0",height:`${(d.hrs/maxHrs)*90}px`,minHeight:2,transition:"height 0.3s"}}/>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:3,paddingLeft:32}}>
          {CHART_DATA.map((d,i)=>(
            <div key={i} style={{flex:1,fontFamily:SANS,fontSize:9,color:C.textDim,textAlign:"center",overflow:"hidden",whiteSpace:"nowrap"}}>{i%2===0?d.label:""}</div>
          ))}
        </div>
        {/* Mode tabs */}
        <div style={{display:"flex",gap:8,marginTop:16}}>
          {["Duration","Volume","Reps"].map(m=>(
            <button key={m} onClick={()=>setChartMode(m)} style={{
              background:chartMode===m?C.accent:"transparent",
              border:`1px solid ${chartMode===m?C.accent:C.border}`,
              color:chartMode===m?"#fff":C.textSub,
              borderRadius:20,padding:"5px 16px",fontSize:12,fontFamily:SANS,cursor:"pointer",transition:"all 0.15s",
            }}>{m}</button>
          ))}
        </div>
      </div>

      {/* Dashboard grid */}
      <div>
        <div style={{fontFamily:SANS,fontSize:12,color:C.textSub,marginBottom:12}}>Dashboard</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[
            {icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.8" strokeLinecap="round"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>, label:"Statistics"},
            {icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.8" strokeLinecap="round"><path d="M6 5v14M18 5v14M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/></svg>, label:"Exercises"},
            {icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>, label:"Measures"},
            {icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textSub} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, label:"Calendar"},
          ].map(item=>(
            <button key={item.label} style={{
              background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px",
              cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"left",
              transition:"all 0.15s",
            }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.borderMid}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}
            >
              {item.icon}
              <span style={{fontFamily:SANS,fontSize:13,fontWeight:500,color:C.text}}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent workouts */}
      <div>
        <div style={{fontFamily:SANS,fontSize:12,color:C.textSub,marginBottom:12}}>Workouts</div>
        {sessions.slice(0,2).map(s=>(
          <div key={s.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 22px",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${C.accent},#0e7fb3)`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <div style={{fontFamily:SANS,fontSize:12,color:C.text}}>cps009</div>
                <div style={{fontFamily:SANS,fontSize:11,color:C.textSub}}>{fmtShortDate(s.date)}</div>
              </div>
              <button style={{marginLeft:"auto",background:"none",border:"none",color:C.textSub,cursor:"pointer",fontSize:16}}>⋯</button>
            </div>
            <div style={{fontFamily:SANS,fontSize:15,fontWeight:600,color:C.text,marginBottom:8}}>{s.name}</div>
            <div style={{display:"flex",gap:24}}>
              <StatPill label="Time" value={fmtDuration(s.duration)}/>
              <StatPill label="Volume" value={`${s.volume.toLocaleString()} kg`}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ────────────────────────────────────────────────────────────────
function AdminPage({sessions}) {
  const topEx = {};
  sessions.forEach(s=>s.exercises.forEach(ex=>{ topEx[ex.name]=(topEx[ex.name]||0)+ex.sets.length; }));
  const top = Object.entries(topEx).sort((a,b)=>b[1]-a[1]).slice(0,5);
  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"36px 28px",display:"flex",flexDirection:"column",gap:16}}>
      <h2 style={{fontFamily:SANS,fontSize:20,fontWeight:600,color:C.text,margin:0}}>Admin Dashboard</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
        {[
          {label:"Members",value:24},{label:"Active Plans",value:18},{label:"Revenue (Mo.)",value:"₹42,500"},
          {label:"Sessions",value:sessions.length},
        ].map(s=>(
          <div key={s.label} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px"}}>
            <div style={{fontFamily:SANS,fontSize:11,color:C.textSub,marginBottom:6}}>{s.label}</div>
            <div style={{fontFamily:SANS,fontSize:22,fontWeight:700,color:C.accentBright}}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px"}}>
          <div style={{fontFamily:SANS,fontSize:13,fontWeight:600,color:C.text,marginBottom:14}}>Top Exercises</div>
          {top.map(([name,count])=>(
            <div key={name} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <span style={{fontFamily:SANS,fontSize:13,color:C.text,flex:1}}>{name}</span>
              <div style={{width:80,height:5,background:C.surface,borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(count/top[0][1])*100}%`,background:C.accent,borderRadius:3}}/>
              </div>
              <span style={{fontFamily:SANS,fontSize:11,color:C.textSub,minWidth:16,textAlign:"right"}}>{count}</span>
            </div>
          ))}
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px"}}>
          <div style={{fontFamily:SANS,fontSize:13,fontWeight:600,color:C.text,marginBottom:14}}>Membership Status</div>
          {[{label:"Active",val:18,color:C.green},{label:"Expired",val:4,color:C.red},{label:"Suspended",val:2,color:C.amber}].map(s=>(
            <div key={s.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:s.color}}/>
                <span style={{fontFamily:SANS,fontSize:13,color:C.text}}>{s.label}</span>
              </div>
              <span style={{fontFamily:SANS,fontSize:14,fontWeight:600,color:C.text}}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DEV PAGE ──────────────────────────────────────────────────────────────────
function DevPage() {
  const [gyms,setGyms] = useState([{id:1,name:"IronCore Central",location:"Delhi, India",contact:"+91 98765 43210"}]);
  const [g,setG] = useState({name:"",location:"",contact:""});
  const inp = {background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 12px",color:C.text,fontFamily:SANS,fontSize:13,outline:"none",width:"100%",boxSizing:"border-box"};
  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"36px 28px",display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <h2 style={{fontFamily:SANS,fontSize:20,fontWeight:600,color:C.text,margin:0}}>Dev Console</h2>
        <span style={{background:"rgba(255,167,38,0.15)",color:C.amber,border:`1px solid rgba(255,167,38,0.3)`,borderRadius:20,padding:"3px 12px",fontFamily:SANS,fontSize:11,fontWeight:600}}>INTERNAL</span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px"}}>
          <div style={{fontFamily:SANS,fontSize:13,fontWeight:600,color:C.text,marginBottom:14}}>Gyms ({gyms.length})</div>
          {gyms.map(g=>(
            <div key={g.id} style={{background:C.surface,borderRadius:10,padding:"12px",marginBottom:8}}>
              <div style={{fontFamily:SANS,fontSize:13,fontWeight:600,color:C.text}}>{g.name}</div>
              <div style={{fontFamily:SANS,fontSize:11,color:C.textSub,marginTop:2}}>{g.location} · {g.contact}</div>
            </div>
          ))}
          <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:10}}>
            <input placeholder="Gym name" value={g.name} onChange={e=>setG(p=>({...p,name:e.target.value}))} style={inp}/>
            <input placeholder="Location" value={g.location} onChange={e=>setG(p=>({...p,location:e.target.value}))} style={inp}/>
            <input placeholder="Contact" value={g.contact} onChange={e=>setG(p=>({...p,contact:e.target.value}))} style={inp}/>
            <Btn onClick={()=>{if(g.name.trim())setGyms(p=>[...p,{...g,id:Date.now()}]);setG({name:"",location:"",contact:""});}}>Add Gym</Btn>
          </div>
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"20px"}}>
          <div style={{fontFamily:SANS,fontSize:13,fontWeight:600,color:C.text,marginBottom:14}}>API Reference (FastAPI)</div>
          {[["POST","/api/gyms","Create gym"],["POST","/api/gym-admins","Create admin"],["POST","/api/members","Register member"],["POST","/api/workout-sessions","Log session"],["GET","/api/members/{id}/sessions","Get sessions"],["GET","/api/gyms/{id}/stats","Gym stats"]].map(([m,p,d])=>(
            <div key={p} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:C.surface,borderRadius:8,marginBottom:5}}>
              <span style={{fontFamily:SANS,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:4,background:m==="GET"?"rgba(30,155,204,0.1)":"rgba(102,187,106,0.1)",color:m==="GET"?C.accentBright:C.green,minWidth:36,textAlign:"center"}}>{m}</span>
              <span style={{fontFamily:SANS,fontSize:11,color:C.text,flex:1}}>{p}</span>
              <span style={{fontFamily:SANS,fontSize:10,color:C.textDim}}>{d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page,setPage] = useState("home");
  const [role,setRole] = useState("Member");
  const [sessions,setSessions] = useState(WORKOUT_HISTORY);
  const [selectedSession,setSelectedSession] = useState(null);
  const [logging,setLogging] = useState(false);
  const [loggingRoutine,setLoggingRoutine] = useState(null);

  function handleFinishWorkout(exs,elapsed) {
    const vol = exs.reduce((a,ex)=>a+ex.sets.filter(s=>s.done).reduce((b,s)=>b+(s.kg*s.reps),0),0);
    const newSession = {
      id:Date.now(), name:"My Workout",
      date:new Date().toISOString().split("T")[0],
      time:new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:true}).toLowerCase(),
      duration:Math.round(elapsed/60)||1,
      volume:vol,
      exercises:exs.map(ex=>({id:ex.id,name:ex.name,sets:ex.sets.map((s,i)=>({no:i+1,kg:s.kg,reps:s.reps}))})),
    };
    setSessions(p=>[newSession,...p]);
    setLogging(false); setLoggingRoutine(null); setPage("history");
  }

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:SANS,color:C.text}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *{margin:0;box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px;}
        input:focus{border-color:${C.accent}!important;outline:none;}
        select option{background:${C.surface};color:${C.text};}
        input[type=number]::-webkit-inner-spin-button{opacity:0.3;}
      `}</style>

      <NavBar
        page={logging?"workout":selectedSession?"history":page}
        setPage={p=>{ if(p!==page||logging||selectedSession){ setLogging(false);setLoggingRoutine(null);setSelectedSession(null);setPage(p); } }}
        role={role} setRole={setRole}
      />

      {logging ? (
        <LogWorkout
          initialRoutine={loggingRoutine}
          onFinish={handleFinishWorkout}
          onDiscard={()=>{ setLogging(false);setLoggingRoutine(null); }}
        />
      ) : selectedSession ? (
        <WorkoutDetail session={selectedSession} onBack={()=>setSelectedSession(null)}/>
      ) : page==="home" ? (
        <HomePage sessions={sessions}/>
      ) : page==="membership" ? (
        <MembershipPage/>
      ) : page==="workout" ? (
        <WorkoutPage
          onStartWorkout={()=>{ setLoggingRoutine(null);setLogging(true); }}
          onStartRoutine={r=>{ setLoggingRoutine(r);setLogging(true); }}
        />
      ) : page==="history" ? (
        <HistoryPage sessions={sessions} onSelect={s=>{ setSelectedSession(s); }}/>
      ) : page==="profile" ? (
        <ProfilePage sessions={sessions}/>
      ) : page==="admin" && (role==="Admin"||role==="Dev") ? (
        <AdminPage sessions={sessions}/>
      ) : page==="dev" && role==="Dev" ? (
        <DevPage/>
      ) : null}
    </div>
  );
}
