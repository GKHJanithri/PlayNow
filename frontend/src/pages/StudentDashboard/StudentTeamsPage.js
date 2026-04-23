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
    <div className="min-h-screen bg-gray-50/50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Student Sports Hub</h1>
          <p className="text-gray-500">Create a team, join as a free agent, and track your registrations.</p>
        </div>

        <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <TabButton active={activeTab === "my-dashboard"} onClick={() => setActiveTab("my-dashboard")} icon={<LayoutGrid className="h-4 w-4" />} label="My Registrations" />
          <TabButton active={activeTab === "create-team"} onClick={() => setActiveTab("create-team")} icon={<Users className="h-4 w-4" />} label="Create a Team" />
          <TabButton active={activeTab === "free-agent"} onClick={() => setActiveTab("free-agent")} icon={<UserPlus className="h-4 w-4" />} label="Join as Free Agent" />
        </div>

        {activeTab === "my-dashboard" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">My Teams</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myTeams.length === 0 ? <div className="text-gray-500 bg-white p-6 rounded-xl border border-gray-200 italic">You aren't on any teams yet.</div> : 
                myTeams.map(team => (
                  <div key={team._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{team.teamName}</h3>
                      <p className="text-sm text-gray-500">{team.eventId?.title || "Unknown Event"}</p>
                    </div>
                    <StatusBadge status={team.status} />
                  </div>
                ))
              }
            </div>

            <h2 className="text-xl font-bold text-gray-900 pt-6">My Free Agent Registrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAgentStatus.length === 0 ? <div className="text-gray-500 bg-white p-6 rounded-xl border border-gray-200 italic">No active free agent registrations.</div> : 
                myAgentStatus.map(agent => (
                  <div key={agent._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-900">{agent.eventId?.title || "Unknown Event"}</h3>
                      <p className="text-sm text-gray-500 capitalize">Skill: {agent.skillLevel}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${agent.status === "Assigned" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>{agent.status}</span>
                  </div>
                ))
              }
            </div>
          </div>
        )}

        {activeTab === "create-team" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
            <form onSubmit={handleCreateTeam} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Team Name</label>
                <input type="text" required className="w-full p-3 border border-gray-300 rounded-lg" value={teamForm.teamName} onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })} />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Select Event</label>
                <select required className="w-full p-3 border border-gray-300 rounded-lg" value={teamForm.eventId} onChange={handleEventSelection}>
                  <option value="">-- Choose an Event --</option>
                  {events.map(event => <option key={event._id} value={event._id}>{event.title}</option>)}
                </select>
              </div>

              {/* 🛠️ NEW: Dynamic Teammate Input Generation */}
              {teammates.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                    <label className="block text-sm font-bold text-indigo-700 mb-2">Add Teammates (Enter their Email Accounts)</label>
                    <p className="text-xs text-gray-500 mb-3">Leave blank if you don't have a full roster yet.</p>
                    <div className="space-y-3">
                        {teammates.map((email, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-400 w-6">{index + 1}.</span>
                                <input 
                                    type="email" 
                                    placeholder="student@example.com"
                                    className="w-full p-2 border border-gray-300 rounded-lg text-sm" 
                                    value={email} 
                                    onChange={(e) => handleTeammateChange(index, e.target.value)} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 mt-4">
                  {loading ? "Submitting..." : "Create Team"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "free-agent" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
            <form onSubmit={handleRegisterAgent} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Target Event</label>
                <select required className="w-full p-3 border border-gray-300 rounded-lg" value={agentForm.eventId} onChange={(e) => setAgentForm({ ...agentForm, eventId: e.target.value })}>
                  <option value="">-- Choose an Event --</option>
                  {events.map(event => <option key={event._id} value={event._id}>{event.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Skill Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Beginner", "Intermediate", "Advanced"].map(level => (
                    <button type="button" key={level} onClick={() => setAgentForm({ ...agentForm, skillLevel: level })} className={`py-2 rounded-lg text-sm font-bold border ${agentForm.skillLevel === level ? "bg-blue-50 border-blue-600 text-blue-700" : "bg-white border-gray-200"}`}>{level}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Position / Experience Notes</label>
                <textarea rows="3" className="w-full p-3 border border-gray-300 rounded-lg" value={agentForm.position} onChange={(e) => setAgentForm({ ...agentForm, position: e.target.value })}></textarea>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400">{loading ? "Registering..." : "Join Free Agent Pool"}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold border-b-2 ${active ? "border-indigo-600 text-indigo-600 bg-indigo-50/30" : "border-transparent text-gray-500 hover:bg-gray-50"}`}>{icon} {label}</button>;
}

function StatusBadge({ status }) {
  if (status === 'Approved') return <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full"><CheckCircle2 className="h-3 w-3"/> Approved</span>;
  if (status === 'Rejected') return <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full"><ShieldAlert className="h-3 w-3"/> Rejected</span>;
  return <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full"><Clock className="h-3 w-3"/> Pending</span>;
}