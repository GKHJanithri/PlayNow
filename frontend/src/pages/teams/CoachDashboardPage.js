import { useState, useEffect } from "react";
import { 
  CheckCircle2, XCircle, User, Edit2, Trash2, X, Save, 
  Users, UserCheck, ShieldAlert, Search, LayoutGrid, List 
} from "lucide-react";
import { toast } from "sonner";

export default function CoachDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [agents, setAgents] = useState([]);
  const [activeTab, setActiveTab] = useState("approvals");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit Modal State
  const [editingTeam, setEditingTeam] = useState(null);
  const [editName, setEditName] = useState("");

  // Utility to get the token for API requests
  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = getToken();
        const headers = { "Authorization": `Bearer ${token}` };

        const [teamsRes, agentsRes] = await Promise.all([
          fetch("http://localhost:5000/api/teams", { headers }),
          fetch("http://localhost:5000/api/free-agents", { headers })
        ]);

        if (!teamsRes.ok || !agentsRes.ok) throw new Error("Failed to fetch data");

        const teamsData = await teamsRes.json();
        const agentsData = await agentsRes.json();

        setTeams(teamsData.map((t) => ({
          id: t._id, name: t.teamName, status: t.status, sport: "Cricket", captain: t.captainId
        })));

        setAgents(agentsData.map((a) => ({
          id: a._id, 
          name: a.studentId || "Unknown Student",
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

  const updateAgentStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/free-agents/${id}/status`, {
        method: "PUT", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        }, 
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      setAgents((prev) => prev.map((a) => a.id === id ? { ...a, status: newStatus } : a));
      toast.success(`Agent ${newStatus.toLowerCase()}!`);
    } catch (error) { toast.error("Error updating agent status"); }
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
      toast.success("Team deleted successfully!");
    } catch (error) { toast.error("Failed to delete team."); }
  };

  const saveTeamEdit = async () => {
    if (!editName.trim()) return toast.error("Team name cannot be empty");
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${editingTeam.id}`, {
        method: "PUT", 
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        }, 
        body: JSON.stringify({ teamName: editName })
      });
      if (!res.ok) throw new Error("Failed to update team");
      setTeams((prev) => prev.map((t) => t.id === editingTeam.id ? { ...t, name: editName } : t));
      setEditingTeam(null);
      toast.success("Team updated successfully!");
    } catch (error) { toast.error("Failed to update team."); }
  };

  const pendingTeams = teams.filter((t) => t.status === "Pending");
  const availableAgents = agents.filter((a) => a.status === "Available");
  const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Coach Command Center</h1>
            <p className="text-gray-500 mt-1">Manage team registrations, free agents, and tournament rosters.</p>
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

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<ShieldAlert className="text-amber-600" />} label="Pending Teams" value={pendingTeams.length} color="bg-amber-50" />
          <StatCard icon={<UserCheck className="text-blue-600" />} label="Free Agents" value={availableAgents.length} color="bg-blue-50" />
          <StatCard icon={<Users className="text-indigo-600" />} label="Total Teams" value={teams.length} color="bg-indigo-50" />
          <StatCard icon={<CheckCircle2 className="text-emerald-600" />} label="Approved" value={teams.filter(t => t.status === 'Approved').length} color="bg-emerald-50" />
        </div>

        {/* Main Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex px-6 border-b border-gray-200 bg-gray-50/50">
            <TabButton active={activeTab === "approvals"} onClick={() => setActiveTab("approvals")} label="Approvals" count={pendingTeams.length} />
            <TabButton active={activeTab === "agents"} onClick={() => setActiveTab("agents")} label="Free Agents" count={availableAgents.length} />
            <TabButton active={activeTab === "all-teams"} onClick={() => setActiveTab("all-teams")} label="All Teams" count={teams.length} />
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <p className="text-gray-500 font-medium">Synchronizing dashboard data...</p>
              </div>
            ) : (
              <>
                {/* Approvals View */}
                {activeTab === "approvals" && (
                  <div className="grid gap-4">
                    {pendingTeams.length === 0 ? <EmptyState message="No teams awaiting approval." /> : 
                      pendingTeams.map((team) => (
                        <div key={team.id} className="group flex items-center justify-between p-5 rounded-xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                              {team.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{team.name}</h3>
                              <p className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                <span className="bg-gray-100 px-2 py-0.5 rounded italic">Captain: {team.captain}</span>
                                <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                                {team.sport}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => updateTeamStatus(team.id, "Approved")} className="btn-success">
                              <CheckCircle2 className="h-4 w-4" /> Approve
                            </button>
                            <button onClick={() => updateTeamStatus(team.id, "Rejected")} className="btn-ghost-red">
                              <XCircle className="h-4 w-4" /> Reject
                            </button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}

                {/* Free Agents View */}
                {activeTab === "agents" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableAgents.length === 0 ? <div className="col-span-full"><EmptyState message="No free agents currently listed." /></div> : 
                      availableAgents.map((agent) => (
                        <div key={agent.id} className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col gap-4 hover:border-blue-200 transition-all">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                                <User className="h-6 w-6" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 leading-none">{agent.name}</h3>
                                <p className="text-xs text-blue-600 font-semibold mt-1 uppercase tracking-wider">{agent.skillLevel}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono">Reg: {agent.registeredDate}</span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 italic border-l-2 border-blue-400">
                             "{agent.position || 'No experience description provided.'}"
                          </div>
                          <div className="flex gap-2 mt-auto pt-2">
                             <button onClick={() => updateAgentStatus(agent.id, "Assigned")} className="flex-1 btn-primary py-2 text-xs">Assign to Team</button>
                             <button onClick={() => updateAgentStatus(agent.id, "Rejected")} className="btn-ghost-red py-2 px-3"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}

                {/* All Teams Grid */}
                {activeTab === "all-teams" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTeams.length === 0 ? <div className="col-span-full"><EmptyState message="No teams found matching your search." /></div> : 
                      filteredTeams.map(team => (
                        <div key={team.id} className="relative group overflow-hidden border border-gray-200 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                          <div className={`h-1.5 w-full ${team.status === 'Approved' ? 'bg-emerald-500' : team.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="font-black text-xl text-gray-900 truncate">{team.name}</h3>
                              <StatusBadge status={team.status} />
                            </div>
                            <div className="space-y-2 mb-6">
                              <InfoRow label="Captain ID" value={team.captain} />
                              <InfoRow label="Active Sport" value={team.sport} />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingTeam(team); setEditName(team.name); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition">
                                <Edit2 className="h-4 w-4" /> Edit
                              </button>
                              <button onClick={() => deleteTeam(team.id)} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition">
                                <Trash2 className="h-4 w-4" /> Delete
                              </button>
                            </div>
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

      {/* Edit Modal */}
      {editingTeam && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-indigo-50/30">
              <h2 className="text-xl font-black text-gray-900">Update Team Name</h2>
              <button onClick={() => setEditingTeam(null)} className="p-2 hover:bg-white rounded-full text-gray-400 hover:text-gray-600 transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-8">
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">New Team Identity</label>
              <input 
                type="text" 
                autoFocus
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                className="w-full text-lg font-bold rounded-2xl border-gray-200 px-5 py-4 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
              />
              <p className="mt-3 text-xs text-gray-400 italic">This will update the team name across all student dashboards.</p>
            </div>
            <div className="px-8 py-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button onClick={() => setEditingTeam(null)} className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-700 transition">Discard</button>
              <button onClick={saveTeamEdit} className="flex-[2] py-3 text-sm font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center justify-center gap-2">
                <Save className="h-4 w-4" /> Save Identity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles Injection */}
      <style>{`
        .btn-success { @apply flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-100 transition-all active:scale-95; }
        .btn-ghost-red { @apply flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95; }
        .btn-primary { @apply flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 transition-all active:scale-95; }
        input[type="text"] { @apply border-gray-200; }
      `}</style>
    </div>
  );
}

/* Helper Components */
function StatCard({ icon, label, value, color }) {
  return (
    <div className={`${color} rounded-2xl p-5 border border-white shadow-sm flex items-center gap-4`}>
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
    <button onClick={onClick} className={`px-6 py-4 text-sm font-black transition-all relative ${active ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"}`}>
      {label}
      {count > 0 && <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{count}</span>}
      {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />}
    </button>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Rejected: "bg-rose-100 text-rose-700 border-rose-200",
    Pending: "bg-amber-100 text-amber-700 border-amber-200"
  };
  return <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>{status}</span>;
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400 font-medium">{label}</span>
      <span className="text-gray-700 font-bold max-w-[120px] truncate">{value}</span>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
        <LayoutGrid className="h-8 w-8 text-gray-200" />
      </div>
      <p className="text-gray-400 font-bold">{message}</p>
    </div>
  );
}