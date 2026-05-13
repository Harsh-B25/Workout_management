import { useState, useEffect } from "react";
import { devService } from "../service/api";

// ─── DESIGN TOKENS (matches RepBase.jsx exactly) ──────────────────────────────
const C = {
  bg:          "#0d0f10",
  surface:     "#141618",
  card:        "#1a1d1f",
  cardHover:   "#1f2224",
  border:      "#252829",
  borderMid:   "#2e3235",
  accent:      "#1e9bcc",
  accentBright:"#2db8ef",
  accentDim:   "rgba(30,155,204,0.12)",
  accentText:  "#4fc3f7",
  red:         "#ef5350",
  redDim:      "rgba(239,83,80,0.12)",
  green:       "#66bb6a",
  greenDim:    "rgba(102,187,106,0.12)",
  amber:       "#ffa726",
  amberDim:    "rgba(255,167,38,0.12)",
  orange:      "#fb923c",
  orangeDim:   "rgba(251,146,60,0.12)",
  text:        "#f0f2f4",
  textSub:     "#8a9099",
  textDim:     "#4a5058",
};
const SANS = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const BODY = "'Inria Sans', Georgia, serif";

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────
export function initials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function Avatar({ name, size = 36, color }) {
  const palette = ["#1e9bcc","#66bb6a","#ffa726","#ef5350","#ab47bc","#26c6da","#fb923c"];
  const c = color || palette[name.charCodeAt(0) % palette.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `${c}20`, border: `1.5px solid ${c}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: SANS, fontSize: Math.round(size * 0.34), fontWeight: 600, color: c,
    }}>
      {initials(name)}
    </div>
  );
}

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontFamily: SANS, fontSize: 11, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
        {icon && <div style={{ color: color || C.accentBright, opacity: 0.5 }}>{icon}</div>}
      </div>
      <div style={{ fontFamily: SANS, fontSize: 28, fontWeight: 700, color: color || C.accentBright, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: BODY, fontSize: 12, color: C.textDim, marginTop: 6, fontWeight: 300 }}>{sub}</div>}
    </div>
  );
}

// ─── DEV DASHBOARD ────────────────────────────────────────────────────────────
export default function DevDashboard({ setPage }) {
  const [stats, setStats] = useState({
    total_gyms: 0,
    total_users: 0,
    total_members: 0,
    total_trainers: 0,
    total_admins: 0,
    role_counts: [],
    gyms_overview: [],
    revenue_by_gym: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await devService.getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch dev dashboard stats:", error);
        // Optionally, set an error state to show a message in the UI
      }
    };
    fetchStats();
  }, []);

  const roleCountsMap = stats.role_counts.reduce((acc, item) => {
    acc[item.role] = item.count;
    return acc;
  }, {});

  const maxMembers = Math.max(...stats.gyms_overview.map(g => g.member_count), 1);
  const maxRev = Math.max(...stats.revenue_by_gym.map(g => g.total_revenue), 1);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "36px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inria+Sans:wght@300;400;700&family=Inter:wght@400;500;600;700&display=swap');
        select option { background: ${C.surface}; color: ${C.text}; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <h2 style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Dev Console</h2>
            <span style={{
              background: C.orangeDim, color: C.orange,
              border: "1px solid rgba(251,146,60,0.3)",
              borderRadius: 20, padding: "3px 12px",
              fontFamily: SANS, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
            }}>INTERNAL</span>
          </div>
          <p style={{ fontFamily: BODY, fontSize: 13, color: C.textSub, margin: 0, fontWeight: 300 }}>
            Platform-wide overview · {stats.total_gyms} gyms · {stats.total_users} users
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setPage("gyms")} style={{
            background: C.accent, border: "none", borderRadius: 9, padding: "9px 18px",
            color: "#fff", fontFamily: SANS, fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 7, transition: "background 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = C.accentBright}
            onMouseLeave={e => e.currentTarget.style.background = C.accent}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            Manage Gyms
          </button>
          <button onClick={() => setPage("admins")} style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 18px",
            color: C.text, fontFamily: SANS, fontSize: 13, fontWeight: 500, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 7, transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accentBright; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border;  e.currentTarget.style.color = C.text; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            Manage Admins
          </button>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        <StatCard label="Gyms Enrolled"  value={stats.total_gyms}    sub="on platform"      color={C.accentBright}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
        />
        <StatCard label="Total Users"    value={stats.total_users}   sub="all roles"         color={C.green}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard label="Members"        value={stats.total_members}   sub="across all gyms"   color={C.text} />
        <StatCard label="Trainers"       value={stats.total_trainers}  sub="across all gyms"   color={C.amber} />
        <StatCard label="Gym Admins"     value={stats.total_admins}  sub="accounts active"   color={C.accentText} />
      </div>

      {/* ── Charts row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px" }}>
          <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3 }}>Member Distribution by Gym</div>
          <div style={{ fontFamily: BODY, fontSize: 12, color: C.textSub, marginBottom: 20, fontWeight: 300 }}>Number of members in each gym</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {stats.gyms_overview.map((d, i) => {
              const isMax = d.member_count === maxMembers;
              const barWidth = maxMembers > 0 ? (d.member_count / maxMembers) * 100 : 0;
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: SANS, fontSize: 11, color: C.text, width: 80, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.gym_name}</span>
                    <div style={{ flex: 1, background: C.surface, borderRadius: 4, height: 8 }}>
                      <div style={{
                        width: `${barWidth}%`,
                        height: "100%",
                        background: isMax ? C.accent : "rgba(30,155,204,0.28)",
                        borderRadius: 4,
                        transition: "width 0.4s",
                      }} />
                    </div>
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 11, color: isMax ? C.accentBright : C.textDim, justifySelf: "end" }}>{d.member_count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* User role breakdown */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px" }}>
          <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3 }}>User Roles</div>
          <div style={{ fontFamily: BODY, fontSize: 12, color: C.textSub, marginBottom: 20, fontWeight: 300 }}>Distribution across {stats.total_users} registered users</div>
          {[
            { role:"member",    label:"Members",    color: C.text },
            { role:"trainer",   label:"Trainers",   color: C.green },
            { role:"gym_admin", label:"Gym Admins", color: C.accentBright },
            { role:"owner",     label:"Owners",     color: C.amber },
          ].map(r => {
            const count = roleCountsMap[r.role] || 0;
            const pct   = stats.total_users ? Math.round((count / stats.total_users) * 100) : 0;
            return (
              <div key={r.role} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: r.color }} />
                    <span style={{ fontFamily: SANS, fontSize: 12, color: C.text }}>{r.label}</span>
                  </div>
                  <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: C.text }}>{count}</span>
                </div>
                <div style={{ height: 5, background: C.surface, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: r.color, borderRadius: 3, transition: "width 0.4s" }}/>
                </div>
              </div>
            );
          })}
          <div style={{ height: 1, background: C.border, margin: "12px 0 10px" }}/>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: BODY, fontSize: 12, color: C.textSub, fontWeight: 300 }}>Total users</span>
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.text }}>{stats.total_users}</span>
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>

        {/* Per-gym breakdown table */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "18px 20px 14px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.text }}>Gyms Overview</div>
            <div style={{ fontFamily: BODY, fontSize: 12, color: C.textSub, marginTop: 2, fontWeight: 300 }}>Members, trainers and admin per gym</div>
          </div>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 70px 70px 70px", padding: "8px 20px", borderBottom: `1px solid ${C.border}` }}>
            {["Gym","Members","Trainers","Admins"].map(h => (
              <div key={h} style={{ fontFamily: SANS, fontSize: 10, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
            ))}
          </div>
          {stats.gyms_overview.map((g, i) => (
            <div key={g.gym_id} style={{
              display: "grid", gridTemplateColumns: "2fr 70px 70px 70px",
              padding: "13px 20px", alignItems: "center",
              borderBottom: i < stats.gyms_overview.length - 1 ? `1px solid ${C.border}` : "none",
              transition: "background 0.12s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.cardHover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <div>
                <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: C.text }}>{g.gym_name}</div>
                <div style={{ fontFamily: BODY, fontSize: 11, color: C.textDim, marginTop: 1, fontWeight: 300 }}>{g.location}</div>
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.text }}>{g.member_count}</div>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.green }}>{g.trainer_count}</div>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.accentBright }}>{g.admin_count}</div>
            </div>
          ))}
        </div>

        {/* Per-gym estimated revenue */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px" }}>
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>Est. Revenue by Gym</div>
          <div style={{ fontFamily: BODY, fontSize: 12, color: C.textSub, marginBottom: 18, fontWeight: 300 }}>Based on active member count</div>
          {stats.revenue_by_gym.map((g, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontFamily: SANS, fontSize: 12, color: C.text }}>{g.gym_name}</span>
                <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: C.amber }}>₹{(g.total_revenue / 1000).toFixed(1)}k</span>
              </div>
              <div style={{ height: 5, background: C.surface, borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(g.total_revenue / maxRev) * 100}%`, background: C.amber, borderRadius: 3, opacity: 0.7, transition: "width 0.4s" }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
