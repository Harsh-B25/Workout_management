import React from 'react';
import { C, SANS } from '../utils/theme';

export default function ProfilePopup({ user, onLogout }) {
  return (
    <div style={{
      position: 'absolute',
      top: 55,
      right: 20,
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      padding: 16,
      zIndex: 110,
      width: 200,
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    }}>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontFamily: SANS, fontWeight: 'bold', fontSize: 14, color: C.text }}>{user.username}</p>
        <p style={{ fontFamily: SANS, fontSize: 12, color: C.textSub }}>{user.email || 'Not available'}</p>
      </div>
      <button onClick={onLogout} style={{
        background: C.accent,
        border: 'none',
        borderRadius: 6,
        color: '#fff',
        fontFamily: SANS,
        fontSize: 13,
        padding: '8px 12px',
        width: '100%',
        cursor: 'pointer',
      }}>
        Logout
      </button>
    </div>
  );
}
