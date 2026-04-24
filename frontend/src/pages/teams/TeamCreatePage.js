import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { SPORTS, sportIcons } from "../../data/sampleData";
import { toast } from "sonner";

export default function TeamCreatePage() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const [sport, setSport] = useState("Cricket");
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState([]);
  const [captainId, setCaptainId] = useState("");
  const [members, setMembers] = useState([{ studentId: "", name: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const isValid = teamName.trim() && eventId.trim() && captainId.trim() && members.every((m) => m.studentId.trim() && m.name.trim());

  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return '';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || payload.id || payload._id || payload.userId || '';
    } catch (error) {
      return '';
    }
  };

  useEffect(() => {
    document.body.className = 'student-pages';
    const loadEvents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/events');
        if (res.ok) {
          const eventsData = await res.json();
          setEvents(eventsData);
        }
      } catch (error) {
        console.error('Failed to load events', error);
      }
    };

    const authCaptainId = getUserIdFromToken();
    if (authCaptainId) {
      setCaptainId(authCaptainId);
    }

    loadEvents();
  }, []);

  const addMember = () => setMembers([...members, { studentId: "", name: "" }]);
  const removeMember = (index) => setMembers(members.filter((_, i) => i !== index));
  const updateMember = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const handleSubmit = async () => {
    setTouched(true);
    
    const resolvedCaptainId = captainId.trim() || getUserIdFromToken();
    if (!isValid || !resolvedCaptainId) {
      toast.error("Please fill out all required fields, including member details.");
      return; 
    }
    
    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamName,
          captainId: resolvedCaptainId,
          eventId,
          members: members.map(m => m.studentId)
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to create team");

      toast.success("Team registration submitted! Pending coach approval.");
      
      setTimeout(() => {
        // Now accurately routes to the new Student Teams page
        navigate("/student/teams"); 
      }, 2000);

    } catch (error) {
      toast.error(error.message || "Could not connect to the server.");
      setSubmitting(false); 
    } 
  };

  return (
    <div className="team-create-page min-h-screen bg-transparent pb-12 relative">
      <div className="mx-auto max-w-2xl p-4 pt-8">
        <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center text-sm font-medium text-white/70 hover:text-white transition-colors drop-shadow">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </button>
        
        <div className="glass-card p-8 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-white">Register New Team</h1>
            <p className="mt-2 text-white/70">Create a team for an upcoming tournament with a clean, polished form.</p>
          </div>

          <form className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm text-white/80">
                <span>Team Name *</span>
                <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="input-field" placeholder="SLIIT Strikers" />
                {touched && !teamName.trim() && <span className="text-sm text-red-300">Required</span>}
              </label>
              <label className="space-y-2 text-sm text-white/80">
                <span>Select Event *</span>
                <select value={eventId} onChange={(e) => setEventId(e.target.value)} className="input-field">
                  <option value="">Choose an event</option>
                  {events.map((event) => (
                    <option key={event._id} value={event._id}>{event.title} ({event.sportType || 'Sport'})</option>
                  ))}
                </select>
                {touched && !eventId.trim() && <span className="text-sm text-red-300">Required</span>}
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm text-white/80">
                <span>Captain *</span>
                <input type="text" value={captainId} onChange={(e) => setCaptainId(e.target.value)} className="input-field bg-white/5" placeholder="Auto-detected captain ID" disabled />
                {touched && !captainId.trim() && <span className="text-sm text-red-300">Required</span>}
              </label>
              <label className="space-y-2 text-sm text-white/80">
                <span>Sport</span>
                <select value={sport} onChange={(e) => setSport(e.target.value)} className="input-field">
                  {SPORTS.map((s) => <option key={s} value={s}>{sportIcons[s]} {s}</option>)}
                </select>
              </label>
            </div>

            <div className="glass-panel p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-white">Team Members</h2>
                  <p className="text-sm text-white/60">Add members by student ID and name.</p>
                </div>
                <button type="button" onClick={addMember} className="secondary-btn inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Member
                </button>
              </div>
              <div className="space-y-4">
                {members.map((member, index) => (
                  <div key={index} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                      <input type="text" placeholder="Student ID *" value={member.studentId} onChange={(e) => updateMember(index, "studentId", e.target.value)} className="input-field" />
                      <input type="text" placeholder="Full Name *" value={member.name} onChange={(e) => updateMember(index, "name", e.target.value)} className="input-field" />
                    </div>
                    {members.length > 1 && (
                      <button type="button" onClick={() => removeMember(index)} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/15 text-red-200 hover:bg-red-500/25 transition-colors">
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {touched && members.some(m => !m.studentId.trim() || !m.name.trim()) && (
                <p className="text-sm text-red-300">All member fields are required.</p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => navigate(-1)} className="secondary-btn flex-1">Cancel</button>
              <button type="button" onClick={handleSubmit} disabled={submitting} className="primary-btn flex-1 disabled:opacity-50">
                {submitting ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</span> : "Submit Registration"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}