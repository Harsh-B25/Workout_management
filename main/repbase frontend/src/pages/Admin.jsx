import { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import ManageMembers from "./ManageMembers";
import ManageTrainers from "./ManageTrainers";
import ManageMemberships from "./ManageMemberships";
import { C, SANS } from "../utils/theme";

export default function Admin({ sessions }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [members, setMembers] = useState(null);
  const [trainers, setTrainers] = useState(null);
  const [memberships, setMemberships] = useState(null);

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "members", label: "Manage Members" },
    { id: "trainers", label: "Manage Trainers" },
    {id: "memberships", label: "Manage Memberships"}

  ];

  const onBack = () => setActiveTab("dashboard");

  return (
    <div style={{ maxWidth: 1024, margin: "0 auto", padding: "36px 28px" }}>
      <div style={{ display: "flex", borderBottom: `1px solid ${C.border}`, marginBottom: 24 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: 600,
              color: activeTab === tab.id ? C.accentBright : C.textSub,
              background: "none",
              border: "none",
              padding: "12px 20px",
              cursor: "pointer",
              borderBottom: activeTab === tab.id ? `2px solid ${C.accentBright}` : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <AdminDashboard
          sessions={sessions}
          members={members}
          trainers={trainers}
          onManageMembers={() => setActiveTab("members")}
          onManageTrainers={() => setActiveTab("trainers")}
          onManageMemberships={() => setActiveTab("memberships")}
        />
      )}
      {activeTab === "members" && (
        <ManageMembers
          members={members}
          setMembers={setMembers}
          onBack={onBack}
        />
      )}
      {activeTab === "trainers" && (
        <ManageTrainers
          trainers={trainers}
          setTrainers={setTrainers}
          onBack={onBack}
        />
      )}
      {activeTab === "memberships" && (
        <ManageMemberships
          memberships={memberships}
          setMemberships={setMemberships}
          onBack={onBack}
        />
      )}
    </div>
  );
}
