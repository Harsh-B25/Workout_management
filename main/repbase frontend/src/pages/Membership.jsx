import { useState, useEffect } from 'react';
import { C, SANS } from '../utils/theme';
import { Btn } from '../components/shared/Btn';
import { membershipService } from '../service/api';
import MembershipSelectModal from './MembershipSelectModal';


export default function Membership() {
  const [currentMember, setCurrentMember] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showSelectModal, setShowSelectModal] = useState(false);
  const userId = localStorage.getItem('user_id');

  const fetchMembershipData = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) return;

    try {
      const [statusRes, plansRes] = await Promise.all([
        membershipService.getStatus(userId),
        membershipService.getPlans(userId)
      ]);
      setCurrentMember(statusRes.data);
      setPlans(plansRes.data);
    } catch (err) {
      console.error("Error loading membership details:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. CALL IT IN USEEFFECT
  useEffect(() => {
    fetchMembershipData();
  }, []);
  const handleConfirmPlan = async (plan) => {
  try {
    const userId = localStorage.getItem('user_id');
    
    // Safely extract the ID. Some objects use 'id', some use 'plan_id'
    const targetPlanId = plan.plan_id || plan.id;

    if (!userId || !targetPlanId) {
      console.error("Missing User ID or Plan ID", { userId, targetPlanId });
      return;
    }

    const payload = {
      user_id: parseInt(userId), // Ensure it's an integer if your DB expects it
      plan_id: parseInt(targetPlanId)
    };

    console.log("Sending payload:", payload);
    await membershipService.updatePlan(payload);
    
    await fetchMembershipData(); // Refresh UI
    setSelectedPlan(null);
  } catch (err) {
    console.error("Failed to update plan:", err.response?.data || err);
  }
};


  if (loading) return <div style={{ color: C.text, padding: 40, fontFamily: SANS }}>Loading membership...</div>;

  // Mapping the API data to your display labels
  const details = currentMember ? [
    { label: "Plan", value: currentMember.plan_name },
    { label: "Status", value: currentMember.is_active ? "Active" : "Expired", accent: currentMember.is_active },
    { label: "Expires", value: currentMember.expiry_date },
    { label: "Gym", value: currentMember.gym_branch || "IronCore Central" },
    { label: "Access", value: currentMember.access_level },
    { label: "Days Left", value: currentMember.days_remaining },
  ] : [];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "36px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
      
      {selectedPlan && (
        <MembershipSelectModal 
          plan={selectedPlan}
          onConfirm={handleConfirmPlan}
          onClose={() => setSelectedPlan(null)
          
          }
        />
      )}

      {/* Current membership Section */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "22px 24px" }}>
        <div style={{ fontFamily: SANS, fontSize: 12, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
          Current membership details
        </div>
        
        {currentMember ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
            {details.map(s => (
              <div key={s.label} style={{ background: C.surface, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontFamily: SANS, fontSize: 11, color: C.textSub, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: s.accent ? C.green : C.text }}>{s.value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: C.textSub, fontFamily: SANS, fontSize: 14 }}>No active membership found.</div>
        )}
      </div>

      {/* Plans catalog Section */}
      <div>
        <div style={{ fontFamily: SANS, fontSize: 12, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>
          Membership plans catalog
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {plans.map(p => (
            
            <div key={p.name} style={{
              background: C.card, border: `1px solid ${p.popular ? C.accent : C.border}`,
              borderRadius: 12, padding: "18px 16px", position: "relative",
            }}>
              {p.popular && (
                <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: C.accent, color: "#fff", fontSize: 10, fontWeight: 700, fontFamily: SANS, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
                  Most Popular
                </div>
              )}
              <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: C.textSub, marginBottom: 12 }}>{p.duration} days</div>
              <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: p.popular ? C.accentBright : C.text, marginBottom: 4 }}>
                ₹{p.price.toLocaleString()}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 11, color: C.textSub, marginBottom: 16 }}>{p.access} Access</div>
              <Btn onClick={() => setSelectedPlan(p)}
              variant={p.popular ? "primary" : "ghost"} style={{ width: "100%", textAlign: "center", padding: "8px", fontSize: 12 }}>
                Select
              </Btn>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}