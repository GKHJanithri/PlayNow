import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, X } from "lucide-react";
import { SPORTS, sportIcons } from "../../data/sampleData";
import { toast } from "sonner";

export default function TeamCreatePage() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const [sport, setSport] = useState("Cricket");
  const [captainId, setCaptainId] = useState("");
  const [members, setMembers] = useState([{ studentId: "", name: "" }]);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const isValid = teamName.trim() && captainId.trim() && members.every((m) => m.studentId.trim() && m.name.trim());

  const addMember = () => setMembers([...members, { studentId: "", name: "" }]);
  const removeMember = (index) => setMembers(members.filter((_, i) => i !== index));
  const updateMember = (index, field, value) => {
    const newMembers = [...members];
    newMembers[index][field] = value;
    setMembers(newMembers);
  };

  const handleSubmit = async () => {
    setTouched(true);
    
    if (!isValid) {
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
          captainId,
          eventId: "650c1f1deadbeef123456789", 
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
    <div className="mx-auto max-w-2xl p-4">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </button>
      
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">Register New Team</h1>
        <p className="mt-1 text-sm text-gray-500">Create a team for an upcoming tournament</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name *</label>
            <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g. SLIIT Strikers" />
            {touched && !teamName.trim() && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>Required</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Captain Student ID *</label>
            <input type="text" value={captainId} onChange={(e) => setCaptainId(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="e.g. IT21..." />
            {touched && !captainId.trim() && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>Required</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
            <select value={sport} onChange={(e) => setSport(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white">
              {SPORTS.map((s) => <option key={s} value={s}>{sportIcons[s]} {s}</option>)}
            </select>
          </div>

          <div className="pt-4">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-base font-medium text-gray-900">Team Members</label>
              <button type="button" onClick={addMember} className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Plus className="h-4 w-4" /> Add Member
              </button>
            </div>
            
            <div className="space-y-3">
              {members.map((member, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="grid flex-1 grid-cols-2 gap-2">
                    <input type="text" placeholder="Student ID *" value={member.studentId} onChange={(e) => updateMember(index, "studentId", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                    <input type="text" placeholder="Full Name *" value={member.name} onChange={(e) => updateMember(index, "name", e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  {members.length > 1 && (
                    <button type="button" onClick={() => removeMember(index)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-red-500">
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {touched && members.some(m => !m.studentId.trim() || !m.name.trim()) && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>All member fields are required.</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button onClick={() => navigate(-1)} className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="flex flex-1 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Registration"}
          </button>
        </div>
      </div>
    </div>
  );
}