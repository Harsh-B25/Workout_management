import { useState } from "react";
import {authService} from '../service/api';

const C = {
  bg:           "#0d0f10",
  surface:      "#141618",
  card:         "#1a1d1f",
  border:       "#252829",
  borderMid:    "#2e3235",
  borderFocus:  "#1e9bcc",
  accent:       "#1e9bcc",
  accentBright: "#2db8ef",
  accentDim:    "rgba(30,155,204,0.12)",
  accentGlow:   "rgba(30,155,204,0.08)",
  red:          "#ef5350",
  redDim:       "rgba(239,83,80,0.10)",
  green:        "#66bb6a",
  text:         "#f0f2f4",
  textSub:      "#8a9099",
  textDim:      "#4a5058",
};

const BODY = "'Inria Sans', Georgia, serif";
const LOGO = "'Inter', 'Helvetica Neue', sans-serif";

// Maps users_auth.role enum values → display label + accent color
const ROLE_META = {
  owner:     { label: "Owner",     color: "#ffa726" },
  gym_admin: { label: "Gym Admin", color: "#2db8ef" },
  trainer:   { label: "Trainer",   color: "#66bb6a" },
  member:    { label: "Member",    color: "#8a9099" },
};

// ── Backend integration ───────────────────────────────────────────────────────
// Calls POST /api/auth/login with { username, password }
// FastAPI should return { user_id, username, role } on success
// or a non-2xx status with { detail: "..." } on failure.
//
// To use: ensure your FastAPI router has:
//   @app.post("/api/auth/login")
//   def login(credentials: LoginSchema, db: Session = Depends(get_db)):
//       user = db.query(UsersAuth).filter(UsersAuth.username == credentials.username).first()
//       if not user or user.password_hash != credentials.password:
//           raise HTTPException(status_code=401, detail="Invalid username or password.")
//       return { "user_id": user.user_id, "username": user.username, "role": user.role }
//
// Note: replace plain password comparison with bcrypt once hashing is added.

// async function apiLogin(username, password) {
//   const res = await fetch("/api/auth/login", {
//     method:  "POST",
//     headers: { "Content-Type": "application/json" },
//     body:    JSON.stringify({ username, password }),
//   });

//   const data = await res.json();

//   if (!res.ok) {
//     // FastAPI raises HTTPException with { detail: "..." }
//     throw new Error(data.detail || "Login failed. Please try again.");
//   }

//   // data = { user_id, username, role }
//   return data;
// }
// ─────────────────────────────────────────────────────────────────────────────

function EyeIcon({ open }) {
  return open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function DumbbellIcon({ size = 32, color = "#1e9bcc" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 5v14M18 5v14M3 8h3M18 8h3M3 16h3M18 16h3M6 12h12"/>
    </svg>
  );
}

export default function LoginPage({ onLogin }) {
  const [username,   setUsername]   = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [authedUser, setAuthedUser] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!username.trim()) { setError("Please enter your username."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }

    setLoading(true);
    try {
      const user = await authService.login(username.trim(), password);
      // user = { user_id, username, role }
      console.log("Login successful:", user["data"]);
      localStorage.setItem("user_id", user["data"].user_id);
      localStorage.setItem("username", user["data"].username);
      localStorage.setItem("role", user["data"].role);
      setAuthedUser(user["data"]);
      setSuccess(true);
      // Pass user up to root — root uses user.role to decide which view to render
      setTimeout(() => onLogin?.(user["data"]), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputBase = {
    width: "100%",
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    padding: "13px 16px",
    color: C.text,
    fontFamily: BODY,
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  const roleMeta = authedUser ? ROLE_META[authedUser.role] : null;

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      display: "flex",
      fontFamily: BODY,
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inria+Sans:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; box-sizing: border-box; }
        ::placeholder { color: ${C.textDim}; font-family: 'Inria Sans', Georgia, serif; font-size: 14px; }
        input:focus { border-color: ${C.borderFocus} !important; }
        ::-webkit-scrollbar { display: none; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.08); }
        }
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes checkPop {
          0%   { transform: scale(0.5); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        .form-card     { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .orb           { animation: pulse 5s ease-in-out infinite; }
        .success-card  { animation: fadeUp 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .progress-fill { animation: progressFill 0.9s linear both; }
      `}</style>

      {/* Background orbs */}
      <div className="orb" style={{
        position: "absolute", top: "-120px", right: "-100px",
        width: 440, height: 440, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(30,155,204,0.13) 0%, transparent 70%)",
        pointerEvents: "none",
      }}/>
      <div className="orb" style={{
        position: "absolute", bottom: "-80px", left: "-80px",
        width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(30,155,204,0.08) 0%, transparent 70%)",
        animationDelay: "2.5s",
        pointerEvents: "none",
      }}/>

      {/* ── Left panel — branding ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 64px",
        borderRight: `1px solid ${C.border}`,
        minWidth: 0,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 64 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DumbbellIcon size={20} color="#fff"/>
          </div>
          <span style={{ fontFamily: LOGO, fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: "0.06em" }}>REPBASE</span>
        </div>

        {/* Headline */}
        <div style={{ maxWidth: 400 }}>
          <h1 style={{
            fontFamily: BODY,
            fontSize: 44,
            fontWeight: 700,
            color: C.text,
            lineHeight: 1.15,
            marginBottom: 20,
            letterSpacing: "-0.5px",
          }}>
            Track every<br/>
            <span style={{ color: C.accentBright }}>rep.</span> Every<br/>
            <span style={{ color: C.accentBright }}>session.</span>
          </h1>
          <p style={{
            fontFamily: BODY,
            fontSize: 16,
            color: C.textSub,
            lineHeight: 1.7,
            fontWeight: 300,
            maxWidth: 340,
          }}>
            Your gym. Your data. Log workouts, track memberships, and analyse your progress — all in one place.
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        width: 480,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 48px",
      }}>
        <div className="form-card" style={{ width: "100%" }}>

          {/* Heading */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: BODY, fontSize: 26, fontWeight: 700, color: C.text, marginBottom: 8 }}>
              Sign in to REPBASE
            </h2>
            <p style={{ fontFamily: BODY, fontSize: 14, color: C.textSub, fontWeight: 300, lineHeight: 1.6 }}>
              Use the credentials provided by your gym administrator. You'll be able to change your password after signing in.
            </p>
          </div>

          {/* ── Success state ── */}
          {success && authedUser && roleMeta ? (
            <div className="success-card" style={{
              background: "rgba(102,187,106,0.07)",
              border: "1px solid rgba(102,187,106,0.25)",
              borderRadius: 14,
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              textAlign: "center",
            }}>
              {/* Check circle */}
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "rgba(102,187,106,0.12)",
                border: "1.5px solid rgba(102,187,106,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" style={{ animation: "checkPop 0.35s 0.1s ease both", opacity: 0, animationFillMode: "forwards" }}>
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>

              {/* Username + role badge */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ fontFamily: BODY, fontSize: 18, fontWeight: 700, color: C.text }}>
                  Welcome back, {authedUser.username}!
                </div>
                <span style={{
                  display: "inline-block",
                  background: `${roleMeta.color}18`,
                  border: `1px solid ${roleMeta.color}40`,
                  color: roleMeta.color,
                  borderRadius: 20,
                  padding: "4px 16px",
                  fontFamily: LOGO,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                }}>
                  {roleMeta.label}
                </span>
              </div>

              <p style={{ fontFamily: BODY, fontSize: 13, color: C.textSub, fontWeight: 300, margin: 0 }}>
                Redirecting you to your dashboard…
              </p>

              {/* Progress bar */}
              <div style={{ width: "100%", height: 3, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                <div className="progress-fill" style={{ height: "100%", background: C.green, borderRadius: 2 }}/>
              </div>
            </div>

          ) : (
            /* ── Login form ── */
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Username */}
              <div>
                <label style={{ fontFamily: BODY, fontSize: 12, color: C.textSub, display: "block", marginBottom: 6, letterSpacing: "0.04em" }}>
                  USERNAME
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="e.g. admin1"
                    value={username}
                    onChange={e => { setUsername(e.target.value); setError(""); }}
                    style={{ ...inputBase, paddingLeft: 42 }}
                    autoComplete="username"
                    autoFocus
                  />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1.8" strokeLinecap="round"
                    style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontFamily: BODY, fontSize: 12, color: C.textSub, letterSpacing: "0.04em" }}>
                    PASSWORD
                  </label>
                  <button type="button" style={{ background: "none", border: "none", color: C.accentBright, fontFamily: BODY, fontSize: 12, cursor: "pointer", padding: 0 }}>
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(""); }}
                    style={{ ...inputBase, paddingLeft: 42, paddingRight: 46 }}
                    autoComplete="current-password"
                  />
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1.8" strokeLinecap="round"
                    style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    style={{
                      position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", color: C.textSub, cursor: "pointer",
                      display: "flex", alignItems: "center",
                    }}
                  >
                    <EyeIcon open={showPass}/>
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: C.redDim,
                  border: "1px solid rgba(239,83,80,0.3)",
                  borderRadius: 10, padding: "11px 14px",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.red} strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
                  </svg>
                  <span style={{ fontFamily: BODY, fontSize: 13, color: C.red }}>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  background: loading ? C.borderMid : C.accent,
                  border: "none",
                  borderRadius: 10,
                  padding: "14px",
                  color: "#fff",
                  fontFamily: BODY,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: loading ? "default" : "pointer",
                  marginTop: 4,
                  transition: "background 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = C.accentBright; }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = C.accent; }}
              >
                {loading ? (
                  <>
                    <div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }}/>
                    Signing in…
                  </>
                ) : "Sign in"}
              </button>

            </form>
          )}

          {/* Admin note — hidden once signed in */}
          {!success && (
            <div style={{
              marginTop: 24,
              background: C.accentDim,
              border: "1px solid rgba(30,155,204,0.2)",
              borderRadius: 10,
              padding: "12px 16px",
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.accentBright} strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
              <p style={{ fontFamily: BODY, fontSize: 13, color: C.textSub, lineHeight: 1.55, fontWeight: 300, margin: 0 }}>
                Don't have an account? Contact your{" "}
                <span style={{ color: C.accentBright }}>gym administrator</span>{" "}
                to get your login credentials.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}