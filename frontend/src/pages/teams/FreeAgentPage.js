import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { SPORTS, sportIcons } from "../../data/sampleData";
import { toast } from "sonner";

export default function FreeAgentPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState([]);
  const [sport, setSport] = useState("Cricket");
  const [skillLevel, setSkillLevel] = useState("Intermediate");
  const [position, setPosition] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const isValid = name.trim() && eventId.trim() && position.trim();

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

    loadEvents();
  }, []);

  const handleSubmit = async () => {
    setTouched(true);
    
    if (!isValid) {
      toast.error("Please fill out all required fields.");
      return;
    }
    
    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/free-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: studentId.trim() || getUserIdFromToken(),
          eventId,
          skillLevel: skillLevel,
          experienceDescription: `Sport: ${sport} | Preferred Position: ${position}`
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to register as free agent");

      toast.success("Registered as free agent! You'll be notified when matched.");
      
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
    <div className="min-h-screen bg-transparent pb-12 relative">
      <div className="mx-auto max-w-lg p-4 pt-8">
        <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-sm font-medium text-white/70 hover:text-white transition-colors drop-shadow">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </button>
        
        <div className="glass-card p-8 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold text-white">Free Agent Registration</h1>
            <p className="mt-2 text-white/70">Sign up to be matched with teams looking for players.</p>
          </div>

          <form className="space-y-6">
            <label className="space-y-2 text-sm text-white/80">
              <span>Full Name *</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
              {touched && !name.trim() && <span className="text-sm text-red-300">Required</span>}
            </label>
            
            <label className="space-y-2 text-sm text-white/80">
              <span>Student ID *</span>
              <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="input-field" />
              {touched && !studentId.trim() && <span className="text-sm text-red-300">Required</span>}
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

            <label className="space-y-2 text-sm text-white/80">
              <span>Sport</span>
              <select value={sport} onChange={(e) => setSport(e.target.value)} className="input-field">
                {SPORTS.map((s) => <option key={s} value={s}>{sportIcons[s]} {s}</option>)}
              </select>
            </label>

            <label className="space-y-2 text-sm text-white/80">
              <span>Skill Level</span>
              <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} className="input-field">
                {['Beginner', 'Intermediate', 'Advanced', 'Expert'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>

            <label className="space-y-2 text-sm text-white/80">
              <span>Preferred Position *</span>
              <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className="input-field" placeholder="e.g. Midfielder, Batsman, Guard" />
              {touched && !position.trim() && <span className="text-sm text-red-300">Required</span>}
            </label>
          </form>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => navigate(-1)} className="secondary-btn flex-1">Cancel</button>
            <button type="button" onClick={handleSubmit} disabled={submitting} className="primary-btn flex-1 disabled:opacity-50">
              {submitting ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Registering...</span> : "Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}