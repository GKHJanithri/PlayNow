import { useState, useEffect } from "react";
import { 
  CheckCircle2, User, Trash2, Edit2, X, Save,
  Users, UserCheck, ShieldAlert, Search, LayoutGrid, Calendar 
} from "lucide-react";
import { toast } from "sonner";

export default function CoachDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [agents, setAgents] = useState([]);
  const [activeTab, setActiveTab] = useState("approvals");
  const [searchQuery, setSearchQuery] = useState("");
  
  // States for inline team editing
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [editingTeamName, setEditingTeamName] = useState("");

  // State for Assign Agent Modal
  const [assignModal, setAssignModal] = useState({ isOpen: false, agent: null });

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const token = getToken();
      const headers = { "Authorization": `Bearer ${token}` };

      let teamsData = [];
      let agentsData = [];

      try {
        // Fetch Teams Independently
        const teamsRes = await fetch("http://localhost:5000/api/teams", { headers });
        if (teamsRes.ok) {
          teamsData = await teamsRes.json();
          
          setTeams(teamsData.map((t) => ({
            id: t._id, 
            name: t.teamName, 
            status: t.status, 
            eventId: t.eventId?._id,
            sport: t.eventId?.title || "No Event", 
            captain: t.captainId?.fullName || "No Captain",
            membersCount: (Array.isArray(t.members) ? t.members.length : 0) + (t.captainId ? 1 : 0)
          })));
        }
      } catch (error) {
        console.error("Teams Fetch Error:", error);
        toast.error("Failed to load teams");
      }

      try {
        // Fetch Agents Independently
        const agentsRes = await fetch("http://localhost:5000/api/free-agents", { headers });
        if (agentsRes.ok) {
          agentsData = await agentsRes.json();
          
          setAgents(agentsData.map((a) => ({
            id: a._id, 
            studentId: a.studentId?.studentId,
            name: a.studentId?.fullName || "Identity Missing",
            email: a.studentId?.email || "",
            eventId: a.eventId?._id,
            event: a.eventId?.title || "Unknown Event", 
            position: a.experienceDescription || "No experience description provided.", 
            skillLevel: a.skillLevel, 
            status: a.status, 
            registeredDate: new Date(a.createdAt).toLocaleDateString()
          })));
        }
      } catch (error) {
        console.error("Agents Fetch Error:", error);
      }

      setLoading(false);
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // --- TEAM ACTIONS ---
  const updateTeamStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${id}/status`, {
        method: "PUT", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        }, 
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      setTeams((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus } : t));
      toast.success(`Team ${newStatus.toLowerCase()}!`);
    } catch (error) { toast.error("Error updating team status"); }
  };

  const deleteTeam = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this team?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error("Failed to delete team");
      setTeams((prev) => prev.filter((t) => t.id !== id));
      toast.success("Team deleted successfully.");
    } catch (error) { toast.error("Failed to delete team."); }
  };

  const saveTeamEdit = async (id) => {
    if (!editingTeamName.trim()) return toast.error("Team name cannot be empty");
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ teamName: editingTeamName })
      });
      if (!res.ok) throw new Error("Failed to update team");
      setTeams((prev) => prev.map((t) => t.id === id ? { ...t, name: editingTeamName } : t));
      setEditingTeamId(null);
      toast.success("Team updated successfully.");
    } catch (error) { toast.error("Failed to update team."); }
  };

  // --- AGENT ACTIONS ---
  const handleAssignSubmit = async (teamId) => {
    try {
      const { agent } = assignModal;
      const res = await fetch(`http://localhost:5000/api/teams/${teamId}/assign`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ studentId: agent.studentId, agentId: agent.id })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to assign agent");
      }

      // Update UI: Remove agent from available list (or update status)
      setAgents((prev) => prev.map((a) => a.id === agent.id ? { ...a, status: "Assigned" } : a));
      
      // Update UI: Add member count to the assigned team
      setTeams((prev) => prev.map((t) => t.id === teamId ? { ...t, membersCount: t.membersCount + 1 } : t));

      toast.success(`${agent.name} assigned to team successfully!`);
      setAssignModal({ isOpen: false, agent: null });
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteAgent = async (id) => {
    if (!window.confirm("Remove this student from the Free Agent pool?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/free-agents/${id}`, { 
        method: "DELETE",
        headers: { "Authorization": `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error("Failed to delete agent");
      setAgents((prev) => prev.filter((a) => a.id !== id));
      toast.success("Agent removed.");
    } catch (error) { toast.error("Failed to delete agent."); }
  };

  const pendingTeams = teams.filter((t) => t.status === "Pending");
  const availableAgents = agents.filter((a) => a.status === "Available");
  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Coach Command Center</h1>
            <p className="text-gray-500 mt-1">Manage team registrations and free agents.</p>
          </div>
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search teams..." 
                  className="pl-9 pr-4 py-2 text-sm border-none focus:ring-0 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<ShieldAlert className="text-amber-600" />} label="Pending Teams" value={pendingTeams.length} color="bg-amber-50" />
          <StatCard icon={<UserCheck className="text-blue-600" />} label="Free Agents" value={availableAgents.length} color="bg-blue-50" />
          <StatCard icon={<Users className="text-indigo-600" />} label="Total Teams" value={teams.length} color="bg-indigo-50" />
          <StatCard icon={<CheckCircle2 className="text-emerald-600" />} label="Approved" value={teams.filter(t => t.status === 'Approved').length} color="bg-emerald-50" />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex px-6 border-b border-gray-200 bg-gray-50/50">
            <TabButton active={activeTab === "approvals"} onClick={() => setActiveTab("approvals")} label="Approvals" count={pendingTeams.length} />
            <TabButton active={activeTab === "agents"} onClick={() => setActiveTab("agents")} label="Free Agents" count={availableAgents.length} />
            <TabButton active={activeTab === "all-teams"} onClick={() => setActiveTab("all-teams")} label="All Teams" count={teams.length} />
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div></div>
            ) : (
              <>
                {/* APPROVALS TAB */}
                {activeTab === "approvals" && (
                  <div className="grid gap-4">
                    {pendingTeams.length === 0 ? <EmptyState message="No pending teams." /> : 
                      pendingTeams.map((team) => (
                        <div key={team.id} className="flex items-center justify-between p-5 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-all">
                          <div>
                            <h3 className="font-bold text-gray-900">{team.name}</h3>
                            <p className="text-xs text-gray-500">{team.sport} • Captain: {team.captain}</p>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => updateTeamStatus(team.id, "Approved")} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700">
                              <CheckCircle2 className="h-4 w-4" /> Approve
                            </button>
                            <button onClick={() => updateTeamStatus(team.id, "Rejected")} className="bg-white border text-rose-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-rose-50">
                              Reject
                            </button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}

                {/* AGENTS TAB */}
                {activeTab === "agents" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableAgents.length === 0 ? <EmptyState message="No available agents." /> : 
                      availableAgents.map((agent) => (
                        <div key={agent.id} className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                              <User className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 leading-none">{agent.name}</h3>
                              <div className="flex gap-2 items-center mt-2">
                                <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold uppercase">{agent.skillLevel}</span>
                                <span className="text-[10px] text-gray-400 font-medium tracking-tight flex items-center gap-1"><Calendar className="h-3 w-3"/> {agent.registeredDate}</span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 italic border-l-2 border-blue-400">
                              "{agent.position}"
                          </div>
                          <div className="text-[11px] text-gray-500 font-bold uppercase">
                            Event: <span className="text-gray-900">{agent.event}</span>
                          </div>
                          <div className="flex gap-2 mt-auto pt-2">
                             <button onClick={() => setAssignModal({ isOpen: true, agent })} className="flex-1 bg-indigo-600 text-white py-2 text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">Assign to Team</button>
                             <button onClick={() => deleteAgent(agent.id)} className="border p-2 rounded-lg text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}

                {/* ALL TEAMS TAB */}
                {activeTab === "all-teams" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeams.length === 0 ? <EmptyState message="No teams found." /> : 
                      filteredTeams.map(team => (
                        <div key={team.id} className="border border-gray-200 bg-white rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            {editingTeamId === team.id ? (
                              <div className="flex-1 mr-2 flex items-center gap-2">
                                <input
                                  type="text"
                                  className="w-full border border-indigo-300 rounded-md text-sm p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  value={editingTeamName}
                                  onChange={(e) => setEditingTeamName(e.target.value)}
                                  autoFocus
                                />
                                <button onClick={() => saveTeamEdit(team.id)} className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-md transition-colors"><Save className="h-4 w-4" /></button>
                                <button onClick={() => setEditingTeamId(null)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-md transition-colors"><X className="h-4 w-4" /></button>
                              </div>
                            ) : (
                              <h3 className="font-black text-lg text-gray-900 truncate pr-2" title={team.name}>{team.name}</h3>
                            )}
                            <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase shrink-0 ${team.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : team.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                              {team.status}
                            </span>
                          </div>
                          
                          <div className="text-sm space-y-1 text-gray-500 mb-6 flex-1">
                            <p>Captain: <span className="text-gray-900 font-bold">{team.captain}</span></p>
                            <p>Event: <span className="text-gray-900 font-bold">{team.sport}</span></p>
                            <p>Members: <span className="text-indigo-600 font-bold">{team.membersCount}</span></p>
                          </div>

                          {/* ACTION BUTTONS */}
                          <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                            <button 
                              onClick={() => { setEditingTeamId(team.id); setEditingTeamName(team.name); }} 
                              className="flex-1 bg-gray-50 text-gray-700 py-2 text-xs font-bold rounded-lg hover:bg-gray-100 flex justify-center items-center gap-1 transition-colors"
                            >
                              <Edit2 className="h-3 w-3"/> Edit
                            </button>
                            <button 
                              onClick={() => deleteTeam(team.id)} 
                              className="border border-gray-200 p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Delete Team"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ASSIGNMENT MODAL OVERLAY */}
      {assignModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-extrabold text-xl text-gray-900">Assign Player</h3>
              <button onClick={() => setAssignModal({ isOpen: false, agent: null })} className="text-gray-400 hover:bg-gray-100 p-1 rounded-md transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">
              Select an approved team to place <span className="font-bold text-gray-900">{assignModal.agent?.name}</span> for <span className="font-bold text-indigo-600">{assignModal.agent?.event}</span>.
            </p>
            
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {teams.filter(t => t.status === "Approved" && t.eventId === assignModal.agent?.eventId).length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm text-gray-500 font-medium">No approved teams available.</p>
                  <p className="text-xs text-gray-400 mt-1">Approve a team for {assignModal.agent?.event} first.</p>
                </div>
              ) : (
                teams.filter(t => t.status === "Approved" && t.eventId === assignModal.agent?.eventId).map(team => (
                  <button 
                    key={team.id} 
                    onClick={() => handleAssignSubmit(team.id)} 
                    className="w-full text-left p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all flex justify-between items-center group"
                  >
                    <div>
                      <span className="font-bold text-gray-900 block">{team.name}</span>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Members: {team.membersCount}</span>
                    </div>
                    <span className="text-xs text-indigo-600 font-bold bg-white border border-indigo-100 px-3 py-1.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      Select
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`${color} rounded-2xl p-5 border border-white shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow`}>
      <div className="p-3 bg-white rounded-xl shadow-sm">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count }) {
  return (
    <button onClick={onClick} className={`px-6 py-4 text-sm font-black relative transition-all ${active ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}>
      {label} {count > 0 && <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{count}</span>}
      {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
    </button>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <LayoutGrid className="h-8 w-8 text-gray-200 mb-2" />
      <p className="text-gray-400 font-bold">{message}</p>
    </div>
  );
}