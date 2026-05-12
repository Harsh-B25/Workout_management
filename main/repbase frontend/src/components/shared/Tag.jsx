import { C, SANS } from '../../utils/constants';

export function Tag({ children, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? C.accentDim : "transparent",
      border: `1px solid ${active ? C.accent : C.border}`,
      color: active ? C.accentText : C.textSub,
      borderRadius: 20, padding: "4px 13px", fontSize: 12, cursor: "pointer", fontFamily: SANS,
      transition: "all 0.15s", whiteSpace: "nowrap",
    }}>{children}</button>
  );
}