import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, User } from "lucide-react";
import { toast } from "sonner";

export default function CoachDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [agents, setAgents] = useState([]);
  const [activeTab, setActiveTab] = useState("approvals");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [teamsRes, agentsRes] = await Promise.all([
          fetch("http://localhost:5000/api/teams"),
          fetch("http://localhost:5000/api/free-agents")
        ]);

        if (!teamsRes.ok || !agentsRes.ok) throw new Error("Failed to fetch data");

        const teamsData = await teamsRes.json();
        const agentsData = await agentsRes.json();

        setTeams(teamsData.map((t) => ({
          id: t._id, name: t.teamName, status: t.status, sport: "Cricket", captain: "ID: " + t.captainId
        })));

        setAgents(agentsData.map((a) => ({
          id: a._id, 
          name: a.studentId || "Unknown Student", // Show the Student ID as the name
          sport: "Cricket", 
          position: a.experienceDescription, 
          skillLevel: a.skillLevel, 
          status: a.status, 
          registeredDate: new Date(a.createdAt).toLocaleDateString()
        })));
      } catch (error) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const updateTeamStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${id}/status`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      setTeams((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus } : t));
      toast.success(`Team ${newStatus.toLowerCase()}!`);
    } catch (error) { toast.error("Error updating team status"); }
  };

  const updateAgentStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/free-agents/${id}/status`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      // Update local state: If approved, we can change status to "Assigned" or "Approved"
      setAgents((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a));
      toast.success(`Agent ${newStatus.toLowerCase()}!`);
    } catch (error) { toast.error("Error updating agent status"); }
  };

  const pendingTeams = teams.filter((t) => t.status === "Pending");
  
  // FIX: Look for "Available" instead of "Pending" to match your Database Model
  const availableAgents = agents.filter((a) => a.status === "Available");

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Coach Dashboard</h1>
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-10">Loading dashboard data...</p>
      ) : (
        <div>
          <div className="flex space-x-4 border-b border-gray-200 mb-6">
            <button onClick={() => setActiveTab("approvals")} className={`pb-2 text-sm font-medium transition-colors ${activeTab === "approvals" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
              Team Approvals ({pendingTeams.length})
            </button>
            <button onClick={() => setActiveTab("agents")} className={`pb-2 text-sm font-medium transition-colors ${activeTab === "agents" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
              Free Agents ({availableAgents.length})
            </button>
            <button onClick={() => setActiveTab("all-teams")} className={`pb-2 text-sm font-medium transition-colors ${activeTab === "all-teams" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}>
              All Teams ({teams.length})
            </button>
          </div>

          {activeTab === "approvals" && (
            <div className="space-y-3">
              {pendingTeams.length === 0 ? <p className="text-sm text-gray-500 py-4">No teams pending approval.</p> : null}
              {pendingTeams.map((team) => (
                <div key={team.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500">{team.captain} · {team.sport}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateTeamStatus(team.id, "Approved")} className="flex items-center rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 transition-colors">
                      <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve
                    </button>
                    <button onClick={() => updateTeamStatus(team.id, "Rejected")} className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                      <XCircle className="mr-1.5 h-4 w-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "agents" && (
            <div className="space-y-3">
              {availableAgents.length === 0 ? <p className="text-sm text-gray-500 py-4">No free agents available for matching.</p> : null}
              {availableAgents.map((agent) => (
                <div key={agent.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                        <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                      <p className="text-sm text-gray-500">{agent.sport} · {agent.position} · <span className="font-medium text-blue-600">{agent.skillLevel}</span></p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => updateAgentStatus(agent.id, "Assigned")} className="flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                      <CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve Agent
                    </button>
                     <button onClick={() => updateAgentStatus(agent.id, "Rejected")} className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                      <XCircle className="mr-1.5 h-4 w-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "all-teams" && (
             <div className="grid gap-2">
                {teams.length === 0 && <p className="text-sm text-gray-500 py-4">No teams registered yet.</p>}
                {teams.map(team => (
                  <div key={team.id} className="p-3 border border-gray-200 bg-white rounded-lg flex justify-between items-center shadow-sm">
                    <span className="font-medium text-gray-900">{team.name}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      team.status === "Approved" ? "bg-green-100 text-green-800" : 
                      team.status === "Rejected" ? "bg-red-100 text-red-800" : 
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {team.status}
                    </span>
                  </div>
                ))}
             </div>
          )}
        </div>
      )}
    </div>
  );
}