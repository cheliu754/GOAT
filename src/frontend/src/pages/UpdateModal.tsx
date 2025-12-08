import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useAuth } from "../AuthContext";
import { apiPost, apiPut } from "../lib/api";
import { toast } from "sonner@2.0.3";

type College = {
  _id: string;
  name?: string;
  INSTNM?: string;
  location?: string;
  CITY?: string;
  STABBR?: string;
  notes?: string;
  applicationStatus?: string;
  essayStatus?: string;
  recommendationStatus?: string;
  deadline?: string;
};

export default function UpdateModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { school?: College } | null;
  const school = state?.school;
  const { user } = useAuth();

  const [status, setStatus] = useState("Not Started");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [essayStatus, setEssayStatus] = useState("Not Started");
  const [recommendationStatus, setRecommendationStatus] = useState("Not Started");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!school) return;
    setStatus(school.applicationStatus || "Not Started");
    setEssayStatus(school.essayStatus || "Not Started");
    setRecommendationStatus(school.recommendationStatus || "Not Started");
    setDeadline(school.deadline || "");
    setNotes(school.notes || "");
  }, [school]);

  const handleClose = () => {
    navigate(-1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate("/signin");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const token = await user.getIdToken();

      const payload = {
        applicationStatus: status,
        essayStatus,
        recommendationStatus,
        deadline,
        notes,
        name: school?.name ?? school?.INSTNM,
        location: school?.location ?? [school?.CITY, school?.STABBR].filter(Boolean).join(", "),
        CITY: school?.CITY,
        STABBR: school?.STABBR,
      };

      if (school?._id) {
        await apiPut(`/api/saved/${school._id}`, payload, token);
      } else {
        await apiPost("/api/saved", payload, token);
      }

      window.dispatchEvent(new CustomEvent("savedUpdated", { detail: { id: school?._id || null } }));
      toast.success("Application updated!");
      handleClose();
    } catch (err: any) {
      console.error("Update failed", err);
      const msg = err?.message || "Failed to save changes";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const schoolName = school?.name ?? school?.INSTNM ?? "Unknown School";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-0 sm:p-3 z-50">
      <div className="bg-white rounded-none sm:rounded-xl shadow-2xl w-full h-full sm:h-auto sm:max-w-md sm:max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2.5 flex justify-between items-center shadow-sm z-10">
          <h2 className="text-gray-900">Update Application</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3">
          <div className="mb-3 pb-3 border-b border-gray-200">
            <h3 className="text-gray-900 mb-0.5">{schoolName}</h3>
            {school?.location && (
              <p className="text-gray-600">{school.location}</p>
            )}
          </div>

          {error && (
            <div className="mb-3 text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label htmlFor="status" className="block text-gray-700 mb-1">
                Application Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Submitted</option>
                <option>Accepted</option>
                <option>Rejected</option>
                <option>Waitlisted</option>
              </select>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-gray-700 mb-1">
                Application Deadline
              </label>
              <input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="essay" className="block text-gray-700 mb-1">
                Essay Status
              </label>
              <select
                id="essay"
                value={essayStatus}
                onChange={(e) => setEssayStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
              >
                <option>Not Started</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>

            <div>
              <label htmlFor="recommendation" className="block text-gray-700 mb-1">
                Recommendation Letters
              </label>
              <select
                id="recommendation"
                value={recommendationStatus}
                onChange={(e) => setRecommendationStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all"
              >
                <option>Not Started</option>
                <option>Requested</option>
                <option>Received</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all resize-none"
                placeholder="Add any notes about this application..."
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 mt-4 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
