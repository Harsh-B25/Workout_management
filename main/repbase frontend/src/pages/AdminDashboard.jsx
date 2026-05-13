import { useState, useEffect } from "react";
import { adminService } from '../service/api';
import { C, SANS, BODY } from '../utils/theme';

// Helper for dynamic avatars based on member names
export function Avatar({ name, size = 36 }) {
  const palette = ["#1e9bcc", "#66bb6a", "#ffa726", "#ef5350", "#ab47bc", "#26c6da"];
  const color = palette[name.charCodeAt(0) % palette.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `${color}20`, border: `1.5px solid ${color}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: SANS, fontSize: Math.round(size * 0.34), fontWeight: 600, color,
    }}>
      {name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ fontFamily: SANS, fontSize: 11, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: SANS, fontSize: 26, fontWeight: 700, color: color || C.accentBright, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: BODY, fontSize: 12, color: C.textDim, marginTop: 6, fontWeight: 300 }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboard({ onManageMembers, onManageTrainers }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem('username') || 'Admin';
  const userid = localStorage.getItem('user_id');

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await adminService.getDashboardMetrics(userid);
        setData(res.data);
      } catch (err) {
        console.error("Error fetching admin metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading) return <div style={{ color: C.text, padding: 40, fontFamily: SANS }}>Loading metrics...</div>;
  if (!data) return <div style={{ color: C.text, padding: 40, fontFamily: SANS }}>Error loading dashboard data.</div>;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "36px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Page header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          {/* Dynamic Gym Name and Location */}
          <h2 style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>
            {data.gymName || "Admin Dashboard"}
          </h2>
          <p style={{ fontFamily: BODY, fontSize: 13, color: C.textSub, margin: "5px 0 0", fontWeight: 300 }}>
            {data.gymLocation || "Management Console"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onManageMembers} style={{ background: C.accent, border: "none", borderRadius: 9, padding: "9px 18px", color: "#fff", fontFamily: SANS, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Manage Members
          </button>
          <button onClick={onManageTrainers} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: "9px 18px", color: C.text, fontFamily: SANS, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            Manage Trainers
          </button>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <StatCard 
          label="Total Members"   
          value={data.totalMembers} 
          sub={`${data.activeCount} currently active`} 
        />
        <StatCard 
          label="Active Trainers" 
          value={data.trainersCount} 
          sub="On duty" 
          color={C.green} 
        />
        
      </div>

      {/* ── Membership Status Dialog ── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px", maxWidth: 400 }}>
        <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3 }}>Membership Status</div>
        <div style={{ fontFamily: BODY, fontSize: 12, color: C.textSub, marginBottom: 20, fontWeight: 300 }}>Real-time enrollment distribution</div>
        
        {[
          { label: "Active",    count: data.activeCount,    color: C.green },
          { label: "Expired",   count: data.expiredCount,   color: C.red },
        ].map(s => (
          <div key={s.label} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color }} />
                <span style={{ fontFamily: SANS, fontSize: 12, color: C.text }}>{s.label}</span>
              </div>
              <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: C.text }}>{s.count}</span>
            </div>
            <div style={{ height: 6, background: C.surface, borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%", 
                background: s.color,
                width: `${data.totalMembers > 0 ? (s.count / data.totalMembers) * 100 : 0}%`,
                transition: "width 0.6s ease-out",
              }}/>
            </div>
          </div>
        ))}
        
        <div style={{ height: 1, background: C.border, margin: "14px 0 12px" }}/>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: BODY, fontSize: 12, color: C.textSub, fontWeight: 300 }}>Database Total</span>
          <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.text }}>{data.totalMembers}</span>
        </div>
      </div>
    </div>
  );
}