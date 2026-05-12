import { C, SANS } from '../../utils/constants';

export function Btn({ children, variant = "primary", onClick, style = {} }) {
  const styles = {
    primary: { background: C.accent, color: "#fff", border: "none" },
    ghost: { background: C.card, color: C.text, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.red, border: `1px solid ${C.border}` },
  };
  return (
    <button onClick={onClick} style={{
      ...styles[variant], borderRadius: 8, padding: "9px 20px", fontSize: 13,
      fontFamily: SANS, fontWeight: 500, cursor: "pointer", transition: "all 0.15s", ...style,
    }}>{children}</button>
  );
}