import { useState } from "react";
import Home from './pages/Home';
import ActiveWorkout from './pages/ActiveWorkout';
import Membership from './pages/Membership';
import WorkoutMenu from "./pages/WorkoutMenu";
import History from "./pages/History";
import WorkoutDetail from "./pages/WorkoutDetail";
// import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import NavBar from './components/NavBar';
import DevDashboard from "./pages/DevDashboard";
import ManageGyms from "./pages/ManageGyms";
import ManageAdmins from "./pages/ManageAdmins";
import LoginPage from "./pages/LoginPage";
import { WORKOUT_HISTORY, ROUTINES } from './utils/constants';
import { C, SANS } from "./utils/theme";

export default function App() {
    const [page, setPage] = useState(null);
    const [sessions, setSessions] = useState(WORKOUT_HISTORY);
    const [role, setRole] = useState(null);
    const [selectedSession, setSelectedSession] = useState(null);
    const [logging, setLogging] = useState(false);
    const [loggingRoutine, setLoggingRoutine] = useState(null);
    const [user, setUser] = useState(null);
    const [selectedSessionId, setSelectedSessionId] = useState(null); // Rename for clarity
    const [authenticated, setAuthenticated] = useState(false);

    function handleFinishWorkout() {
        
        setLogging(false); setLoggingRoutine(null); setPage("history");
    }
    function handleLogin(loggedInUser) {
            setAuthenticated(true);
            setUser(loggedInUser);
            setTimeout(() => {
                console.log("User role from login:", loggedInUser.role);
                if (loggedInUser.role === "gym_admin") {
                    setRole("Admin");
                    setPage("admin");
                } else if (loggedInUser.role === "member") {
                    setRole("Member");
                    setPage("home");
                } else if (loggedInUser.role === "owner") {
                    setRole("owner");
                    setPage("dev");
                }
            }, 0);
        }
    
    function handleLogout() {
            setAuthenticated(false);
            setUser(null);
            setRole("Member");
            setPage("home");
        }
    
    if (!authenticated) {
            return <LoginPage onLogin={handleLogin} />;
        }

    return (
        <div style={{ background: C.bg, minHeight: "100vh", fontFamily: SANS, color: C.text }}>
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
                page={page}
                setPage={p => { 
                    if (p !== page || logging || selectedSession) { 
                        setLogging(false); 
                        setLoggingRoutine(null); 
                        setSelectedSession(null); 
                        setPage(p); 
                        setSelectedSessionId(null);
                    } 
                }}
                onLogout={handleLogout}
                user={user}
                role={role}
            />

            {logging ? (
                <ActiveWorkout
                    initialRoutine={loggingRoutine}
                    onFinish={handleFinishWorkout}
                    onDiscard={() => { setLogging(false); setLoggingRoutine(null); }}
                />
            ) : selectedSessionId ? (
                <WorkoutDetail sessionId ={selectedSessionId} onBack={() => setSelectedSessionId(null)} />
            ) : page === "home" ? (
                <Home sessions={sessions} />
            ) : page === "membership" ? (
                <Membership 
            
                />
            ) : page === "workout" ? (
                <WorkoutMenu
                    onStartWorkout={() => { setLoggingRoutine(null); setLogging(true); }}
                    onStartRoutine={r => { setLoggingRoutine(r); setLogging(true); }}
                    routines={ROUTINES}
                />
            ) : page === "history" ? (
                <History sessions={sessions} onSelect={id => { setSelectedSessionId(id); }} />
            
            ) : page === "admin" && (role === "Admin" || role === "Dev") ? (
                <Admin sessions={sessions} />

            ) : page === "dev" && role === "owner" ? (
                <DevDashboard setPage={setPage} />
            ) : page === "gyms" && role === "owner" ? (
                <ManageGyms setPage={setPage} />
            ) : page === "admins" && role === "owner" ? (
                <ManageAdmins setPage={setPage} />
            ) : null}
        </div>
    );
}

            
        