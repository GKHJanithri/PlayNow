import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { SPORTS, sportIcons } from "../../data/sampleData";
import { toast } from "sonner";

export default function FreeAgentPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [sport, setSport] = useState("Cricket");
  const [skillLevel, setSkillLevel] = useState("Intermediate");
  const [position, setPosition] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const isValid = name.trim() && studentId.trim() && position.trim();

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
          studentId: studentId, 
          eventId: "650c1f1deadbeef123456789", 
          skillLevel: skillLevel,
          experienceDescription: `Sport: ${sport} | Preferred Position: ${position}`
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to register as free agent");

      toast.success("Registered as free agent! You'll be notified when matched.");
      
      setTimeout(() => {
        // 👇 CHANGED THIS LINE: Change "/events" to any valid route in your App.js!
        navigate("/events"); 
      }, 2000); 

    } catch (error) {
      toast.error(error.message || "Could not connect to the server.");
      setSubmitting(false); 
    } 
  };

  return (
    <div className="mx-auto max-w-lg p-4">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </button>
      
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Free Agent Registration</h1>
        <p className="mt-1 text-sm text-gray-500">Register to be matched with a team</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            {touched && !name.trim() && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>Required</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
            <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            {touched && !studentId.trim() && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>Required</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
            <select value={sport} onChange={(e) => setSport(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
              {SPORTS.map((s) => <option key={s} value={s}>{sportIcons[s]} {s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
            <select value={skillLevel} onChange={(e) => setSkillLevel(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
              {["Beginner", "Intermediate", "Advanced", "Expert"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Position *</label>
            <input type="text" value={position} onChange={(e) => setPosition(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g. Midfielder, Batsman, Guard" />
            {touched && !position.trim() && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>Required</p>}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button onClick={() => navigate(-1)} className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="flex flex-1 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registering...</> : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}