import { useState, useEffect } from "react";
import { 
  CheckCircle2, User, Trash2, Edit2, X,
  Users, UserCheck, ShieldAlert, Search, LayoutGrid, Calendar 
} from "lucide-react";
import { toast } from "sonner";

export default function CoachDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [agents, setAgents] = useState([]);
  const [activeTab, setActiveTab] = useState("approvals");
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for team details modal and editable name
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTeamName, setSelectedTeamName] = useState("");

  // State for Assign Agent Modal
  const [assignModal, setAssignModal] = useState({ isOpen: false, agent: null });

  const getToken = () => localStorage.getItem('token');

  useEffect(() => {
    document.body.className = 'coach-pages';
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
            members: Array.isArray(t.members) ? t.members.map((m) => ({
              id: String(m._id),
              fullName: m.fullName,
              email: m.email,
              studentId: m.studentId || ""
            })) : [],
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
            studentObjectId: a.studentId?._id ? String(a.studentId._id) : "",
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

  const openTeamDetails = (team) => {
    setSelectedTeam(team);
    setSelectedTeamName(team.name);
  };

  const closeTeamDetails = () => {
    setSelectedTeam(null);
    setSelectedTeamName("");
  };

  const updateTeamName = async (id) => {
    if (!selectedTeamName.trim()) return toast.error("Team name cannot be empty");
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ teamName: selectedTeamName })
      });
      if (!res.ok) throw new Error("Failed to update team");
      setTeams((prev) => prev.map((t) => t.id === id ? { ...t, name: selectedTeamName } : t));
      setSelectedTeam((prev) => prev ? { ...prev, name: selectedTeamName } : prev);
      toast.success("Team updated successfully.");
    } catch (error) { toast.error("Failed to update team."); }
  };

  const removeTeamMember = async (teamId, memberId) => {
    if (!window.confirm("Remove this player from the team?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/teams/${teamId}/remove-member`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ memberId })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to remove member");
      }

      setTeams((prev) => prev.map((t) => {
        if (t.id !== teamId) return t;
        const updatedMembers = t.members.filter((m) => m.id !== memberId);
        return {
          ...t,
          members: updatedMembers,
          membersCount: updatedMembers.length + (t.captain ? 1 : 0)
        };
      }));

      setSelectedTeam((prev) => {
        if (!prev || prev.id !== teamId) return prev;
        const updatedMembers = prev.members.filter((m) => m.id !== memberId);
        return {
          ...prev,
          members: updatedMembers,
          membersCount: updatedMembers.length + (prev.captain ? 1 : 0)
        };
      });

      setAgents((prev) => prev.map((agent) => {
        if (agent.studentObjectId === memberId) {
          return { ...agent, status: "Available" };
        }
        return agent;
      }));

      toast.success("Member removed from team.");
    } catch (error) {
      toast.error(error.message);
    }
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

      const responseData = await res.json();
      const updatedTeam = responseData.team;

      // Update UI: Remove agent from available list (or update status)
      setAgents((prev) => prev.map((a) => a.id === agent.id ? { ...a, status: "Assigned" } : a));
      
      // Update UI: Add the new member to the team's members array with full details
      if (updatedTeam && updatedTeam.members && updatedTeam.members.length > 0) {
        const newMember = updatedTeam.members[updatedTeam.members.length - 1];
        const memberData = {
          id: String(newMember._id),
          fullName: newMember.fullName,
          email: newMember.email,
          studentId: newMember.studentId || ""
        };

        // Update the team in the teams list
        setTeams((prev) => prev.map((t) => {
          if (t.id === teamId) {
            return {
              ...t,
              members: [...t.members, memberData],
              membersCount: t.membersCount + 1
            };
          }
          return t;
        }));

        // Update the selectedTeam modal if it's open and matches the assigned team
        if (selectedTeam && selectedTeam.id === teamId) {
          setSelectedTeam((prev) => ({
            ...prev,
            members: [...prev.members, memberData],
            membersCount: prev.membersCount + 1
          }));
        }
      }

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
    <div className="min-h-screen bg-transparent pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">Coach Command Center</h1>
            <p className="text-white/80 mt-1 drop-shadow">Manage team registrations and free agents.</p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-1.5 rounded-lg border border-white/20 shadow-lg">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                <input 
                  type="text" 
                  placeholder="Search teams..." 
                  className="pl-9 pr-4 py-2 text-sm border-none bg-white/10 text-white placeholder-white/70 focus:ring-2 focus:ring-white/30 rounded-md backdrop-blur-sm w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<ShieldAlert className="text-amber-300" />} label="Pending Teams" value={pendingTeams.length} color="bg-gradient-to-br from-amber-500 to-orange-600" />
          <StatCard icon={<UserCheck className="text-blue-300" />} label="Free Agents" value={availableAgents.length} color="bg-gradient-to-br from-blue-500 to-cyan-600" />
          <StatCard icon={<Users className="text-purple-300" />} label="Total Teams" value={teams.length} color="bg-gradient-to-br from-purple-500 to-pink-600" />
          <StatCard icon={<CheckCircle2 className="text-emerald-300" />} label="Approved" value={teams.filter(t => t.status === 'Approved').length} color="bg-gradient-to-br from-emerald-500 to-teal-600" />
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="flex px-6 border-b border-white/20 bg-white/5 backdrop-blur-sm">
            <TabButton active={activeTab === "approvals"} onClick={() => setActiveTab("approvals")} label="Approvals" count={pendingTeams.length} />
            <TabButton active={activeTab === "agents"} onClick={() => setActiveTab("agents")} label="Free Agents" count={availableAgents.length} />
            <TabButton active={activeTab === "all-teams"} onClick={() => setActiveTab("all-teams")} label="All Teams" count={teams.length} />
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div></div>
            ) : (
              <>
                {/* APPROVALS TAB */}
                {activeTab === "approvals" && (
                  <div className="grid gap-4">
                    {pendingTeams.length === 0 ? <EmptyState message="No pending teams." /> : 
                      pendingTeams.map((team) => (
                        <div key={team.id} className="flex items-center justify-between p-5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all shadow-xl">
                          <div>
                            <h3 className="font-bold text-white drop-shadow">{team.name}</h3>
                            <p className="text-xs text-white/70">{team.sport} • Captain: {team.captain}</p>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => updateTeamStatus(team.id, "Approved")} className="bg-emerald-500/80 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-600/80 backdrop-blur-sm">
                              <CheckCircle2 className="h-4 w-4" /> Approve
                            </button>
                            <button onClick={() => updateTeamStatus(team.id, "Rejected")} className="bg-white/10 border border-white/30 text-red-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-500/20 backdrop-blur-sm">
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
                        <div key={agent.id} className="p-5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm shadow-xl flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-white/20 text-white flex items-center justify-center backdrop-blur-sm">
                              <User className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="font-bold text-white leading-none">{agent.name}</h3>
                              <div className="flex gap-2 items-center mt-2">
                                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded font-bold uppercase backdrop-blur-sm">{agent.skillLevel}</span>
                                <span className="text-[10px] text-white/70 font-medium tracking-tight flex items-center gap-1"><Calendar className="h-3 w-3"/> {agent.registeredDate}</span>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white/10 rounded-lg p-3 text-sm text-white/80 italic border-l-2 border-white/30 backdrop-blur-sm">
                              "{agent.position}"
                          </div>
                          <div className="text-[11px] text-white/70 font-bold uppercase">
                            Event: <span className="text-white">{agent.event}</span>
                          </div>
                          <div className="flex gap-2 mt-auto pt-2">
                             <button onClick={() => setAssignModal({ isOpen: true, agent })} className="flex-1 bg-white/20 text-white py-2 text-xs font-bold rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm">Assign to Team</button>
                             <button onClick={() => deleteAgent(agent.id)} className="border border-white/30 p-2 rounded-lg text-red-300 hover:bg-red-500/20 backdrop-blur-sm"><Trash2 className="h-4 w-4" /></button>
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
                        <div key={team.id} className="border border-white/20 bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl flex flex-col hover:bg-white/20 transition-all duration-300">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-black text-lg text-white truncate pr-2" title={team.name}>{team.name}</h3>
                            <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase shrink-0 ${team.status === 'Approved' ? 'bg-emerald-500/80 text-white' : team.status === 'Rejected' ? 'bg-red-500/80 text-white' : 'bg-amber-500/80 text-white'}`}>
                              {team.status}
                            </span>
                          </div>
                          
                          <div className="text-sm space-y-1 text-white/80 mb-6 flex-1">
                            <p>Captain: <span className="text-white font-bold">{team.captain}</span></p>
                            <p>Event: <span className="text-white font-bold">{team.sport}</span></p>
                            <p>Members: <span className="text-purple-300 font-bold">{team.membersCount}</span></p>
                          </div>

                          {/* ACTION BUTTONS */}
                          <div className="flex gap-2 mt-auto pt-4 border-t border-white/20">
                            <button 
                              onClick={() => openTeamDetails(team)} 
                              className="flex-1 bg-white/20 text-white py-2 text-xs font-bold rounded-lg hover:bg-white/30 flex justify-center items-center gap-1 transition-colors backdrop-blur-sm"
                            >
                              <Edit2 className="h-3 w-3"/> Edit
                            </button>
                            <button 
                              onClick={() => deleteTeam(team.id)} 
                              className="border border-white/30 p-2 rounded-lg text-red-300 hover:bg-red-500/20 transition-colors backdrop-blur-sm"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-extrabold text-xl text-white drop-shadow-lg">Assign Player</h3>
              <button onClick={() => setAssignModal({ isOpen: false, agent: null })} className="text-white/70 hover:bg-white/10 p-2 rounded-md transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-sm text-white/70 mb-6 drop-shadow">
              Select an approved team to place <span className="font-bold text-white">{assignModal.agent?.name}</span> for <span className="font-bold text-white">{assignModal.agent?.event}</span>.
            </p>
            
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
              {teams.filter(t => t.status === "Approved" && t.eventId === assignModal.agent?.eventId).length === 0 ? (
                <div className="text-center py-6 bg-white/5 rounded-lg border border-white/20 backdrop-blur-sm">
                  <p className="text-sm text-white/70 font-medium">No approved teams available.</p>
                  <p className="text-xs text-white/50 mt-1">Approve a team for {assignModal.agent?.event} first.</p>
                </div>
              ) : (
                teams.filter(t => t.status === "Approved" && t.eventId === assignModal.agent?.eventId).map(team => (
                  <button 
                    key={team.id} 
                    onClick={() => handleAssignSubmit(team.id)} 
                    className="w-full text-left p-4 border border-white/30 rounded-xl hover:border-white/50 hover:bg-white/10 transition-all flex justify-between items-center group backdrop-blur-sm"
                  >
                    <div>
                      <span className="font-bold text-white block drop-shadow">{team.name}</span>
                      <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider">Members: {team.membersCount}</span>
                    </div>
                    <span className="text-xs text-white font-bold bg-white/20 border border-white/30 px-3 py-1.5 rounded-lg group-hover:bg-white/30 transition-colors backdrop-blur-sm">
                      Select
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTeam && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h3 className="font-extrabold text-xl text-white drop-shadow-lg">Team Details</h3>
                <p className="text-white/70 drop-shadow">Review members and unassign mistakes.</p>
              </div>
              <button onClick={closeTeamDetails} className="text-white/70 hover:bg-white/10 p-2 rounded-md transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <div>
                <label className="text-xs font-bold uppercase text-white/70">Team Name</label>
                <input
                  type="text"
                  value={selectedTeamName}
                  onChange={(e) => setSelectedTeamName(e.target.value)}
                  className="mt-2 w-full border border-white/30 rounded-xl px-4 py-3 text-sm bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase text-white/70">Event</div>
                <div className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur-sm">{selectedTeam.sport}</div>
                <div className="text-xs font-bold uppercase text-white/70">Status</div>
                <div className="rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur-sm">{selectedTeam.status}</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm font-bold text-white mb-2">Team captain</div>
              <div className="rounded-2xl border border-white/30 bg-white/10 p-4 text-sm text-white backdrop-blur-sm">{selectedTeam.captain}</div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Assigned Members</h4>
                  <p className="text-xs text-white/70">Remove any member assigned by mistake.</p>
                </div>
                <span className="text-xs font-semibold text-purple-300">{selectedTeam.members.length} members</span>
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                {selectedTeam.members.length === 0 ? (
                  <div className="rounded-2xl border border-white/30 bg-white/5 p-6 text-center text-sm text-white/70 backdrop-blur-sm">
                    No members are currently assigned to this team.
                  </div>
                ) : (
                  selectedTeam.members.map((member) => (
                    <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-white/30 p-4 bg-white/10 backdrop-blur-sm">
                      <div>
                        <p className="font-semibold text-white">{member.fullName}</p>
                        <p className="text-xs text-white/70">{member.email || 'No email provided'}</p>
                      </div>
                      <button
                        onClick={() => removeTeamMember(selectedTeam.id, member.id)}
                        className="text-red-300 bg-red-500/20 hover:bg-red-500/30 rounded-xl px-4 py-2 text-xs font-bold transition-colors backdrop-blur-sm"
                      >
                        Unassign
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-white/20">
              <button
                onClick={() => updateTeamName(selectedTeam.id)}
                className="inline-flex items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm px-4 py-3 text-sm font-bold text-white hover:bg-white/30 transition-colors"
              >
                Save Team Name
              </button>
              <button
                onClick={closeTeamDetails}
                className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-3 text-sm font-bold text-white hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`${color} rounded-2xl p-5 border border-white/20 shadow-xl flex items-center gap-4 hover:scale-105 transition-transform backdrop-blur-sm`}>
      <div className="p-3 bg-white/20 rounded-xl shadow-lg backdrop-blur-sm">{icon}</div>
      <div>
        <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-white">{value}</p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label, count }) {
  return (
    <button onClick={onClick} className={`px-6 py-4 text-sm font-black relative transition-all ${active ? "text-white" : "text-white/70 hover:text-white"}`}>
      {label} {count > 0 && <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/20 text-white backdrop-blur-sm' : 'bg-white/10 text-white/70 backdrop-blur-sm'}`}>{count}</span>}
      {active && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full" />}
    </button>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <LayoutGrid className="h-8 w-8 text-white/30 mb-2" />
      <p className="text-white/70 font-bold">{message}</p>
    </div>
  );
}