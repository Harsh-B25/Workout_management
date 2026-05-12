import { useState } from 'react';
import { C, SANS } from '../utils/theme';
import ProfilePopup from './ProfilePopup';

export default function NavBar({ page, setPage, onLogout, user, role }) {
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  let tabs = [
    { id: "home", label: "Home" },
    { id: "membership", label: "Membership" },
    { id: "workout", label: "Workout" },
    { id: "history", label: "History" },
    { id: "profile", label: "Profile" },
  ];

  if (role !== "Member") {
    tabs = [];
  }

  const handleProfileClick = () => {
    setShowProfilePopup(!showProfilePopup);
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: C.surface, borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", padding: "0 28px", height: 52, gap: 32,
    }}>
      {/* Logo Section */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginRight: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: 4, background: C.accent, display: "flex", alignItems: "center", justifyCenter: "center" }}>
          <span style={{ color: "#fff", fontWeight: 900 }}>R</span>
        </div>
        <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: "0.05em" }}>REPBASE</span>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: 2, flex: 1 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setPage(t.id)} style={{
            background: page === t.id ? C.accentDim : "transparent",
            border: "none",
            color: page === t.id ? C.accentBright : C.textSub,
            borderRadius: 7, padding: "5px 14px", fontSize: 13, cursor: "pointer",
            fontFamily: SANS, fontWeight: page === t.id ? 600 : 400, transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Profile Icon */}
      <div style={{ position: 'relative' }}>
        <img
          src="src/assets/profile.png"
          alt="Profile"
          style={{ width: 32, height: 32, borderRadius: '50%', cursor: 'pointer' }}
          onClick={handleProfileClick}
        />
        {showProfilePopup && <ProfilePopup user={user} onLogout={onLogout} />}
      </div>
    </nav>
  );
}