// import { useState, useEffect } from "react";
// import { C, SANS } from '../utils/theme';
// import { StatPill } from "../components/shared/StatPill";
// import { fmtShortDate, fmtDuration } from "../utils/formatters";
// import { profileService } from '../service/api';

// export default function ProfilePage({ sessions }) {
//   const [chartMode, setChartMode] = useState("Duration");
//   const [stats, setStats] = useState({ workouts: 0, followers: 0, following: 0 });
//   const [activity, setActivity] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const userId = localStorage.getItem("user_id");

//   useEffect(() => {
//     async function loadProfile() {
//       try {
//         const [statsRes, activityRes] = await Promise.all([
//           profileService.getUserStats(userId),
//           profileService.getActivityData(userId, chartMode.toLowerCase())
//         ]);
//         setStats(statsRes.data);
//         setActivity(activityRes.data);
//       } catch (e) {
//         console.error("Failed to load profile", e);
//       } finally {
//         setLoading(false);
//       }
//     }
//     if (userId) loadProfile();
//   }, [userId, chartMode]);

//   // Calculate chart max safely
//   const maxVal = activity.length > 0 ? Math.max(...activity.map(d => d.value)) : 10;

//   if (loading) return <div style={{ color: C.textSub, padding: 40, textAlign: "center" }}>Loading Profile...</div>;

//   return (
//     <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
      
//       {/* Profile header */}
//       <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
//         <div style={{ width: 68, height: 68, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent},#0e7fb3)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
//           <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
//         </div>
//         <div style={{ flex: 1 }}>
//           <div style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 10 }}>
//             {localStorage.getItem("username") || "User"}
//           </div>
//           <div style={{ display: "flex", gap: 28 }}>
//             {[
//               { label: "Workouts", value: stats.workouts },
//               { label: "Followers", value: stats.followers },
//               { label: "Following", value: stats.following }
//             ].map(s => (
//               <div key={s.label}>
//                 <div style={{ fontFamily: SANS, fontSize: 11, color: C.textSub }}>{s.label}</div>
//                 <div style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: C.text }}>{s.value}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Chart */}
//       <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
//           <div>
//             <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: C.text }}>Weekly Activity</span>
//           </div>
//         </div>

//         {/* Bar chart */}
//         <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120, marginBottom: 8, marginTop: 16, paddingLeft: 32, position: "relative" }}>
//           {/* Y axis Grid Lines */}
//           {[0, 0.5, 1].map(v => (
//             <div key={v} style={{ 
//                 position: "absolute", left: 0, right: 0, 
//                 bottom: `${v * 100}%`, 
//                 borderBottom: v > 0 ? `1px dashed ${C.border}` : "none",
//                 fontFamily: SANS, fontSize: 10, color: C.textDim, paddingBottom: 2
//             }}>
//               {v === 0 ? "" : Math.round(maxVal * v)}
//             </div>
//           ))}

//           {activity.map((d, i) => (
//             <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, zIndex: 1 }}>
//               <div style={{ 
//                 width: "100%", background: C.accent, borderRadius: "3px 3px 0 0", 
//                 height: `${(d.value / maxVal) * 100}%`, 
//                 minHeight: 2, transition: "height 0.4s ease-out" 
//               }} />
//               <div style={{ fontFamily: SANS, fontSize: 9, color: C.textDim }}>{d.label}</div>
//             </div>
//           ))}
//         </div>

//         {/* Mode tabs */}
//         <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
//           {["Duration", "Volume", "Reps"].map(m => (
//             <button key={m} onClick={() => setChartMode(m)} style={{
//               background: chartMode === m ? C.accent : "transparent",
//               border: `1px solid ${chartMode === m ? C.accent : C.border}`,
//               color: chartMode === m ? "#fff" : C.textSub,
//               borderRadius: 20, padding: "5px 16px", fontSize: 12, fontFamily: SANS, cursor: "pointer", transition: "all 0.15s",
//             }}>{m}</button>
//           ))}
//         </div>
//       </div>

//       {/* Recent workouts List from props */}
//       <div>
//         <div style={{ fontFamily: SANS, fontSize: 12, color: C.textSub, marginBottom: 12 }}>Recent Workouts</div>
//         {sessions.slice(0, 3).map(s => (
//           <div key={s.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 22px", marginBottom: 10 }}>
//             <div style={{ fontFamily: SANS, fontSize: 11, color: C.textSub, marginBottom: 4 }}>{fmtShortDate(s.date)}</div>
//             <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 8 }}>{s.name}</div>
//             <div style={{ display: "flex", gap: 24 }}>
//               <StatPill label="Time" value={fmtDuration(s.duration)} />
//               <StatPill label="Volume" value={`${s.volume?.toLocaleString() || 0} kg`} />
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }