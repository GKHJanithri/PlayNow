import { useState, useEffect } from "react";
import { Users, UserPlus, LayoutGrid, CheckCircle2, ShieldAlert, Clock } from "lucide-react";
import { toast } from "sonner";

const getUserIdFromToken = () => {
  try {
    let token = localStorage.getItem('token');
    if (!token) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        token = userObj.token;
      }
    }
    
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload._id || payload.userId || payload.studentId || payload.sub || (payload.user && (payload.user.id || payload.user._id));
           
  } catch (e) {
    return null;
  }
};

export default function StudentTeamsPage() {
  const [activeTab, setActiveTab] = useState("my-dashboard");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [myTeams, setMyTeams] = useState([]);
  const [myAgentStatus, setMyAgentStatus] = useState([]);

  const [teamForm, setTeamForm] = useState({ teamName: "", eventId: "" });
  const [teammates, setTeammates] = useState([]); // 🛠️ NEW: Array to hold dynamic teammate inputs
  
  const [agentForm, setAgentForm] = useState({ eventId: "", position: "", skillLevel: "Beginner" });

  const getToken = () => {
    let token = localStorage.getItem('token');
    if (!token) {
        const userStr = localStorage.getItem('user');
        if (userStr) token = JSON.parse(userStr).token;
    }
    return token;
  };
  
  const userId = getUserIdFromToken();

  useEffect(() => {
    document.body.className = 'student-pages';
    fetchEvents();
    if (userId) fetchMyDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchEvents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/events");
      if (res.ok) setEvents(await res.json());
    } catch (error) {
      console.error("Failed to fetch events", error);
    }
  };

  const fetchMyDashboardData = async () => {
    try {
      const headers = { "Authorization": `Bearer ${getToken()}` };
      const [teamsRes, agentsRes] = await Promise.all([
        fetch("http://localhost:5000/api/teams", { headers }),
        fetch("http://localhost:5000/api/free-agents", { headers })
      ]);

      if (teamsRes.ok && agentsRes.ok) {
        const allTeams = await teamsRes.json();
        const allAgents = await agentsRes.json();

        setMyTeams(allTeams.filter(t => t.captainId?._id === userId || (t.members && t.members.some(m => m._id === userId))));
        setMyAgentStatus(allAgents.filter(a => a.studentId?._id === userId));
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    }
  };

  // 🛠️ NEW: Calculate teammate slots based on Sport Type
  const handleEventSelection = (e) => {
    const selectedEventId = e.target.value;
    setTeamForm({ ...teamForm, eventId: selectedEventId });

    const selectedEvent = events.find(ev => ev._id === selectedEventId);
    if (selectedEvent && selectedEvent.sportType) {
        const sport = selectedEvent.sportType.toLowerCase();
        let limit = 5; // Default for things like Basketball, Futsal
        
        if (sport.includes('cricket') || sport.includes('football') || sport.includes('soccer')) limit = 11;
        if (sport.includes('volleyball')) limit = 6;
        if (sport.includes('badminton')) limit = 2; // Doubles

        // limit - 1 because the Captain (logged in user) takes 1 slot!
        setTeammates(new Array(limit - 1).fill(""));
    } else {
        setTeammates([]); // Clear if no event selected
    }
  };

  const handleTeammateChange = (index, value) => {
    const newTeammates = [...teammates];
    newTeammates[index] = value;
    setTeammates(newTeammates);
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!userId) {
        alert("Authentication error: User ID missing. Please log in again.");
        return toast.error("Authentication error: User ID missing.");
    }

    setLoading(true);
    try {
      const payload = {
        teamName: teamForm.teamName,
        eventId: teamForm.eventId,
        captainId: userId,
        // 🛠️ NEW: Remove empty strings from teammate emails before sending
        teammates: teammates.filter(email => email.trim() !== "") 
      };

      const res = await fetch("http://localhost:5000/api/teams", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}` 
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create team.");

      toast.success("Team created successfully!");
      setTeamForm({ teamName: "", eventId: "" });
      setTeammates([]); // Reset teammate fields
      fetchMyDashboardData();
      setActiveTab("my-dashboard");
    } catch (error) {
      toast.error(error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAgent = async (e) => {
    e.preventDefault();
    if (!userId) {
        alert("Authentication error: User ID missing. Please log in again.");
        return toast.error("Authentication error: User ID missing.");
    }

    const alreadyRegistered = myAgentStatus.some(a => (a.eventId?._id || a.eventId) === agentForm.eventId);
    if (alreadyRegistered) {
        alert("You are already registered as a free agent for this event!");
        return toast.error("You are already registered as a free agent for this event!");
    }

    setLoading(true);
    try {
      const payload = {
        eventId: agentForm.eventId,
        position: agentForm.position, 
        skillLevel: agentForm.skillLevel,
        studentId: userId 
      };

      const res = await fetch("http://localhost:5000/api/free-agents", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getToken()}` 
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to register.");

      toast.success("Successfully registered as a Free Agent!");
      alert("Success! You are now in the Free Agent pool.");
      
      setAgentForm({ eventId: "", position: "", skillLevel: "Beginner" });
      fetchMyDashboardData(); 
      setActiveTab("my-dashboard"); 
    } catch (error) {
      toast.error(error.message);
      alert(`Error: ${error.message}`); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 relative">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="glass-card p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-200/80">Team Management</p>
              <h1 className="mt-3 text-3xl font-extrabold text-white">Your student team dashboard</h1>
              <p className="mt-3 max-w-xl text-sm text-white/70">Create squads, apply as a free agent, and track approvals in a unified, calm dashboard.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
              <div className="glass-panel text-center">
                <p className="text-sm text-white/70">Teams</p>
                <p className="mt-2 text-3xl font-black text-white">{myTeams.length}</p>
              </div>
              <div className="glass-panel text-center">
                <p className="text-sm text-white/70">Free agent regs</p>
                <p className="mt-2 text-3xl font-black text-white">{myAgentStatus.length}</p>
              </div>
              <div className="glass-panel text-center">
                <p className="text-sm text-white/70">Open events</p>
                <p className="mt-2 text-3xl font-black text-white">{events.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button onClick={() => setActiveTab("my-dashboard")} className={`pill-tab ${activeTab === "my-dashboard" ? "active" : "inactive"}`}>
            <LayoutGrid className="h-4 w-4" /> My Registrations
          </button>
          <button onClick={() => setActiveTab("create-team")} className={`pill-tab ${activeTab === "create-team" ? "active" : "inactive"}`}>
            <Users className="h-4 w-4" /> Create a Team
          </button>
          <button onClick={() => setActiveTab("free-agent")} className={`pill-tab ${activeTab === "free-agent" ? "active" : "inactive"}`}>
            <UserPlus className="h-4 w-4" /> Join Free Agent
          </button>
        </div>

        {activeTab === "my-dashboard" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white drop-shadow-lg">My Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myTeams.length === 0 ? <div className="text-white/70 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 italic drop-shadow">You aren't on any teams yet.</div> : 
                myTeams.map(team => (
                  <div key={team._id} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-white/20 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-white drop-shadow">{team.teamName}</h3>
                      <p className="text-sm text-white/70">{team.eventId?.title || "Unknown Event"}</p>
                    </div>
                    <StatusBadge status={team.status} />
                  </div>
                ))
              }
            </div>

            <h2 className="text-xl font-bold text-white drop-shadow-lg pt-6">My Free Agent Registrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAgentStatus.length === 0 ? <div className="text-white/70 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 italic drop-shadow">No active free agent registrations.</div> : 
                myAgentStatus.map(agent => (
                  <div key={agent._id} className="bg-white/10 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-white/20 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white drop-shadow">{agent.eventId?.title || "Unknown Event"}</h3>
                      <p className="text-sm text-white/70 capitalize">Skill: {agent.skillLevel}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm ${agent.status === "Assigned" ? "bg-emerald-500/80 text-white" : "bg-blue-500/80 text-white"}`}>{agent.status}</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {activeTab === "create-team" && (
          <div className="glass-card p-8">
            <div className="mb-6">
              <h2 className="section-heading">Create a Team</h2>
              <p className="text-sm text-white/70">Build your squad and submit it for coach approval.</p>
            </div>
            <form onSubmit={handleCreateTeam} className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 text-sm text-white/80">
                  <span>Team Name</span>
                  <input type="text" required value={teamForm.teamName} onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })} placeholder="SLIIT Strikers" className="input-field" />
                </label>
                <label className="space-y-2 text-sm text-white/80">
                  <span>Select Event</span>
                  <select required value={teamForm.eventId} onChange={handleEventSelection} className="input-field">
                    <option value="">Choose an event</option>
                    {events.map(event => <option key={event._id} value={event._id}>{event.title}</option>)}
                  </select>
                </label>
              </div>

              {teammates.length > 0 && (
                <div className="glass-panel p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-white">Add Teammates</h3>
                      <p className="text-sm text-white/60">Enter teammate emails to create your initial roster.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {teammates.map((email, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <span className="w-6 text-white/70">{index + 1}.</span>
                        <input type="email" placeholder="student@example.com" value={email} onChange={(e) => handleTeammateChange(index, e.target.value)} className="input-field" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="primary-btn w-full">{loading ? "Submitting..." : "Create Team"}</button>
            </form>
          </div>
        )}

        {activeTab === "free-agent" && (
          <div className="glass-card p-8">
            <div className="mb-6">
              <h2 className="section-heading">Join the Free Agent Pool</h2>
              <p className="text-sm text-white/70">Register once and we'll surface your profile to teams looking for talent.</p>
            </div>
            <form onSubmit={handleRegisterAgent} className="space-y-6">
              <label className="space-y-2 text-sm text-white/80">
                <span>Target Event</span>
                <select required className="input-field" value={agentForm.eventId} onChange={(e) => setAgentForm({ ...agentForm, eventId: e.target.value })}>
                  <option value="">Choose an event</option>
                  {events.map(event => <option key={event._id} value={event._id}>{event.title}</option>)}
                </select>
              </label>

              <div>
                <p className="mb-3 text-sm font-semibold text-white/80">Skill Level</p>
                <div className="grid grid-cols-3 gap-3">
                  {["Beginner", "Intermediate", "Advanced"].map(level => (
                    <button type="button" key={level} onClick={() => setAgentForm({ ...agentForm, skillLevel: level })} className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${agentForm.skillLevel === level ? "bg-white/20 border-white/40 text-white" : "bg-white/10 border-white/20 text-white/70 hover:bg-white/15"}`}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <label className="space-y-2 text-sm text-white/80">
                <span>Position / Experience Notes</span>
                <textarea rows="4" className="input-field" value={agentForm.position} onChange={(e) => setAgentForm({ ...agentForm, position: e.target.value })} placeholder="Preferred position, skills, or experience" />
              </label>

              <button type="submit" disabled={loading} className="primary-btn w-full">{loading ? "Registering..." : "Join Free Agent Pool"}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'Approved') return <span className="flex items-center gap-1 text-xs font-bold text-white bg-emerald-500/80 px-3 py-1 rounded-full backdrop-blur-sm"><CheckCircle2 className="h-3 w-3"/> Approved</span>;
  if (status === 'Rejected') return <span className="flex items-center gap-1 text-xs font-bold text-white bg-red-500/80 px-3 py-1 rounded-full backdrop-blur-sm"><ShieldAlert className="h-3 w-3"/> Rejected</span>;
  return <span className="flex items-center gap-1 text-xs font-bold text-white bg-amber-500/80 px-3 py-1 rounded-full backdrop-blur-sm"><Clock className="h-3 w-3"/> Pending</span>;
}