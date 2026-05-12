import { C, SANS } from '../../utils/theme';

export function StatPill({ label, value, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 11, color: C.textSub, fontFamily: SANS }}>{label}</span>
      <span style={{ fontSize: 15, fontWeight: 600, color: accent ? C.accentBright : C.text, fontFamily: SANS }}>
        {value}
      </span>
    </div>
  );
}