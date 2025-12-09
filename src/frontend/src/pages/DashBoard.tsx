import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, GraduationCap, CheckCircle2, Circle, Clock, LayoutGrid, List, X } from "lucide-react";
import { useAuth } from "../AuthContext";
import { apiDelete, apiGet, apiPut } from "../lib/api";
import { toast } from "sonner@2.0.3";

type College = {
  _id: string;
  INSTNM?: string;
  CITY?: string;
  STABBR?: string;
  name?: string;
  location?: string;
  applicationStatus?: string;
  essayStatus?: string;
  recommendationStatus?: string;
  deadline?: string;
  notes?: string;
};

export default function DashBoard() {
  const location = useLocation();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; college: College | null }>({ 
    show: false, 
    college: null 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  const loadSaved = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!user) {
        setColleges([]);
        setLoading(false);
        return;
      }
      const token = await user.getIdToken();
      const res = await apiGet<{ success: boolean; data: College[] }>("/api/saved", token);
      const next = res?.data || [];
      setColleges(next);
      setSelectedCollege((prev) => {
        if (!next.length) return null;
        if (prev) {
          const found = next.find((c) => c._id === prev._id);
          return found || next[0];
        }
        return next[0];
      });
    } catch (err: any) {
      console.error("Load saved colleges failed", err);
      setError(err?.message || "Failed to load saved colleges");
      setColleges([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  useEffect(() => {
    const handler = () => loadSaved();
    window.addEventListener("savedUpdated", handler);
    return () => {
      window.removeEventListener("savedUpdated", handler);
    };
  }, [loadSaved]);

  const scrollByAmount = 300;

  const scrollLeft = () => {
    scrollerRef.current?.scrollBy({ left: -scrollByAmount, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollerRef.current?.scrollBy({ left: scrollByAmount, behavior: "smooth" });
  };

  const handleDeleteClick = (college: College, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm({ show: true, college });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.college || !user) return;
    const targetId = deleteConfirm.college._id;
    try {
      setDeletingId(targetId);
      const token = await user.getIdToken();
      await apiDelete(`/api/saved/${targetId}`, token);
      setColleges(colleges.filter((c) => c._id !== targetId));
      if (selectedCollege?._id === targetId) {
        setSelectedCollege(null);
      }
    } catch (err: any) {
      console.error("Delete failed", err);
      toast.error(err?.message || "Delete failed");
    } finally {
      setDeletingId(null);
      setDeleteConfirm({ show: false, college: null });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, college: null });
  };

  const openNotesModal = () => {
    if (!selectedCollege) return;
    setNoteDraft(selectedCollege.notes || "");
    setNotesOpen(true);
  };

  const persistNotes = async (nextNotes: string, isDelete = false) => {
    if (!user) {
      toast.error("Please sign in to save notes.");
      return;
    }
    if (!selectedCollege?._id) return;

    try {
      setSavingNote(true);
      const token = await user.getIdToken();
      const res = await apiPut<{ success: boolean; data?: College }>(
        `/api/saved/${selectedCollege._id}`,
        { notes: nextNotes },
        token
      );
      const updatedCollege: College = res?.data
        ? { ...selectedCollege, ...res.data }
        : { ...selectedCollege, notes: nextNotes };

      setColleges((prev) =>
        prev.map((c) => (c._id === updatedCollege._id ? updatedCollege : c))
      );
      setSelectedCollege(updatedCollege);
      toast.success(isDelete ? "Delete success" : "Notes saved");
      setNotesOpen(false);
    } catch (err: any) {
      console.error("Save notes failed", err);
      toast.error(err?.message || "Failed to save notes");
    } finally {
      setSavingNote(false);
    }
  };

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    persistNotes(noteDraft, false);
  };

  const handleDeleteNotes = async () => {
    setNoteDraft("");
    await persistNotes("", true);
  };

  // Calculate progress percentage
  const calculateProgress = (college: College) => {
    // Rejected is considered terminal, so mark as 100%.
    if (college.applicationStatus === "Rejected") return 100;

    const steps = [
      college.applicationStatus,
      college.essayStatus,
      college.recommendationStatus
    ];
    const completed = steps.filter(status => 
      status === "Completed" || status === "Submitted" || status === "Received" || status === "Accepted"
    ).length;
    return Math.round((completed / steps.length) * 100);
  };

  const getStepStatus = (status?: string) => {
    const completedStates = ["Completed", "Submitted", "Received", "Accepted"];
    const inProgressStates = ["In Progress", "Requested"];
    const rejectedStates = ["Rejected", "Reject", "Denied"];
    
    if (!status || status === "Not Started") return "not-started";
    if (rejectedStates.includes(status)) return "rejected";
    if (completedStates.includes(status)) return "completed";
    if (inProgressStates.includes(status)) return "in-progress";
    return "not-started";
  };

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
      <section className="mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3">
          <div>
            <h1 className="text-gray-900 mb-0.5">Your Colleges</h1>
            <p className="text-gray-600">Track your college applications and deadlines</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === "list" 
                  ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {viewMode === "grid" ? (
                <>
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List View</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">Default View</span>
                </>
              )}
            </button>
            <Link 
              to="/colleges" 
              className="w-full sm:w-auto text-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-teal-400 text-white rounded-lg hover:from-blue-600 hover:to-teal-500 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Browse Schools
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-3 text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 sm:py-12 bg-white rounded-xl shadow-sm">
          <div className="text-gray-600">Loading your saved colleges…</div>
        </div>
      ) : colleges.length === 0 ? (
        <div className="text-center py-10 sm:py-12 bg-white rounded-xl shadow-sm">
          <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3" />
          <h2 className="text-gray-900 mb-1.5">No colleges saved yet</h2>
          <p className="text-gray-600 mb-4 px-4">Start browsing colleges and add them to your dashboard</p>
          <Link 
            to="/colleges" 
            className="inline-block px-4 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Colleges
          </Link>
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <>
              {/* Desktop: Horizontal scrolling carousel */}
              <div className="hidden sm:block relative">
                <button 
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-all hover:scale-110 -ml-3"
                  onClick={scrollLeft}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-700" />
                </button>
                <button 
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-all hover:scale-110 -mr-3"
                  onClick={scrollRight}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4 text-gray-700" />
                </button>

                <section 
                  className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
                  ref={scrollerRef}
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {colleges.map((c) => (
                    <article 
                      className={`relative flex-none w-[240px] h-[250px] overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all p-3 snap-start cursor-pointer ${
                        c.applicationStatus === "Rejected"
                          ? 'bg-red-50 border-2 border-red-200'
                          : selectedCollege?._id === c._id 
                          ? 'bg-white border-2 border-indigo-500 ring-2 ring-indigo-100'
                          : 'bg-white border border-gray-100'
                      }`}
                      key={c._id}
                      onClick={() => setSelectedCollege(c)}
                    >
                      {/* Delete X button in top-right corner */}
                      <button
                        className="absolute top-2 right-2 p-1 rounded-full bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 transition-all z-10"
                        onClick={(e) => handleDeleteClick(c, e)}
                        aria-label="Delete college"
                      >
                        <X className="w-4 h-4 text-gray-500 hover:text-red-600" />
                      </button>

                      <div className="flex flex-col h-full">
                        <header className="mb-2">
                          <span className="text-2xl mb-1.5 block">🎓</span>
                          <h2
                            className="text-gray-900 mb-0.5 leading-tight pr-6 min-h-[2.75rem]"
                            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                          >
                            {c.name ?? c.INSTNM}
                          </h2>
                        </header>

                        <dl className="mb-3 space-y-1.5">
                          <div className="flex justify-between items-center min-h-[1.25rem]">
                            <dt className="text-gray-500">Location</dt>
                            <dd className="text-gray-900 text-right text-sm truncate">
                              {c.location ?? [c.CITY, c.STABBR].filter(Boolean).join(", ")}
                            </dd>
                          </div>
                        </dl>

                        <div className="mt-auto pt-2 border-t border-gray-100">
                          <Link
                            to="/update"
                            state={{ backgroundLocation: location, school: c }}
                            className="block w-full px-2 py-1.5 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Update
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </section>
              </div>

              {/* Mobile: Vertical stacking */}
              <div className="sm:hidden space-y-2">
                {colleges.map((c) => (
                    <article 
                      className={`relative rounded-xl shadow-md p-3 cursor-pointer h-full ${
                      c.applicationStatus === "Rejected"
                        ? 'bg-red-50 border-2 border-red-200'
                        : selectedCollege?._id === c._id 
                          ? 'bg-white border-2 border-indigo-500 ring-2 ring-indigo-100' 
                          : 'bg-white border border-gray-100'
                    }`}
                    key={c._id}
                    onClick={() => setSelectedCollege(c)}
                  >
                    {/* Delete X button in top-right corner */}
                    <button
                      className="absolute top-2 right-2 p-1 rounded-full bg-white hover:bg-red-50 border border-gray-200 hover:border-red-300 transition-all z-10"
                      onClick={(e) => handleDeleteClick(c, e)}
                      aria-label="Delete college"
                    >
                      <X className="w-4 h-4 text-gray-500 hover:text-red-600" />
                    </button>

                    <div className="flex flex-col h-full">
                      <header className="mb-2 flex items-start gap-2">
                        <span className="text-2xl">🎓</span>
                        <div className="flex-1 pr-6 min-w-0">
                          <h2
                            className="text-gray-900 mb-0.5 leading-tight min-h-[2.75rem]"
                            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                          >
                            {c.name ?? c.INSTNM}
                          </h2>
                          <p className="text-gray-600 truncate min-h-[1.25rem]">
                            {c.location ?? [c.CITY, c.STABBR].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      </header>

                      <Link
                        to="/update"
                        state={{ backgroundLocation: location, school: c }}
                        className="block w-full px-2 py-1.5 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-center mt-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Update
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* List View - Desktop & Tablet */}
              <section className="hidden sm:block space-y-3">
                {colleges.map((c) => {
                  const progress = calculateProgress(c);
                  return (
                    <article 
                      key={c._id}
                      className={`rounded-xl shadow-md hover:shadow-lg transition-all p-4 ${
                        c.applicationStatus === "Rejected"
                          ? 'bg-red-50 border-2 border-red-200'
                          : 'bg-white border border-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-3xl">🎓</span>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1">
                              <h2 className="text-gray-900 mb-1 leading-tight">{c.name ?? c.INSTNM}</h2>
                              <p className="text-gray-600">{c.location ?? [c.CITY, c.STABBR].filter(Boolean).join(", ")}</p>
                            </div>
                            
                            {c.deadline && (
                              <div className="text-right text-sm">
                                <div className="text-gray-500">Deadline</div>
                                <div className="text-gray-900">{new Date(c.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                              </div>
                            )}
                          </div>

                          <div className="mb-3">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-gray-600">Application Progress</span>
                              <span className="text-indigo-600">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                              <div>
                                <span className="text-gray-500">Application: </span>
                                <span className="text-gray-900">{c.applicationStatus || "Not Started"}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Essay: </span>
                                <span className="text-gray-900">{c.essayStatus || "Not Started"}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Recommendation: </span>
                                <span className="text-gray-900">{c.recommendationStatus || "Not Started"}</span>
                              </div>
                            </div>
                          </div>

                          <Link
                            to="/update"
                            state={{ backgroundLocation: location, school: c }}
                            className="inline-block px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                          >
                            Update Status
                          </Link>
                          <button
                            className="inline-block px-4 py-2 ml-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            onClick={(e) => handleDeleteClick(c, e)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>

              {/* List View - Mobile */}
              <section className="sm:hidden space-y-3">
                {colleges.map((c) => {
                  const progress = calculateProgress(c);
                  return (
                    <article 
                      key={c._id}
                      className={`rounded-xl shadow-md p-3 ${
                        c.applicationStatus === "Rejected"
                          ? 'bg-red-50 border-2 border-red-200'
                          : 'bg-white border border-gray-100'
                      }`}
                    >
                      <header className="mb-2 flex items-start gap-2">
                        <span className="text-2xl">🎓</span>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-gray-900 mb-0.5 leading-tight">{c.name ?? c.INSTNM}</h2>
                          <p className="text-gray-600">{c.location ?? [c.CITY, c.STABBR].filter(Boolean).join(", ")}</p>
                        </div>
                      </header>

                      {c.deadline && (
                        <div className="mb-3 text-sm flex justify-between">
                          <span className="text-gray-500">Deadline:</span>
                          <span className="text-gray-900">{new Date(c.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      )}

                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-gray-600 text-sm">Application Progress</span>
                          <span className="text-indigo-600 text-sm">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Application:</span>
                            <span className="text-gray-900">{c.applicationStatus || "Not Started"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Essay:</span>
                            <span className="text-gray-900">{c.essayStatus || "Not Started"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Recommendation:</span>
                            <span className="text-gray-900">{c.recommendationStatus || "Not Started"}</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        to="/update"
                        state={{ backgroundLocation: location, school: c }}
                        className="block w-full px-2 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors text-center"
                      >
                        Update Status
                      </Link>
                      <button
                        className="block w-full px-2 py-2 mt-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-center"
                        onClick={(e) => handleDeleteClick(c, e)}
                      >
                        Delete
                      </button>
                    </article>
                  );
                })}
              </section>
            </>
          )}

          {/* Progress Section - Only show in Grid View */}
          {viewMode === "grid" && (
            <section className="mt-5">
              {selectedCollege ? (
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h2 className="text-gray-900 mb-0.5">Application Progress</h2>
                        <p className="text-gray-600">
                          Complete these steps for {selectedCollege.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:self-start">
                      <button
                        onClick={openNotesModal}
                        className="px-3 py-1 rounded-full text-white shadow-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed order-1 sm:order-1 w-full sm:w-auto text-center whitespace-nowrap flex-shrink-0"
                        style={{
                          backgroundImage: "linear-gradient(90deg, #ff4d4f, #ffd666)"
                        }}
                        disabled={!selectedCollege}
                      >
                        My Notes
                      </button>
                      <div className="flex items-center gap-1.5 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full whitespace-nowrap order-2 sm:order-2">
                        <span>{calculateProgress(selectedCollege)}% Complete</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-gray-700">Overall Progress</span>
                      <span className="text-gray-500">
                        {[selectedCollege.applicationStatus, selectedCollege.essayStatus, selectedCollege.recommendationStatus]
                          .filter(s => s === "Completed" || s === "Submitted" || s === "Received" || s === "Accepted").length} of 3 steps
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${calculateProgress(selectedCollege)}%` }}
                      />
                    </div>
                  </div>

                  {/* Progress Steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Application Step */}
                    <div className={`p-3 rounded-lg border-2 transition-all ${
                      getStepStatus(selectedCollege.applicationStatus) === 'completed' 
                        ? 'bg-green-50 border-green-200'
                        : getStepStatus(selectedCollege.applicationStatus) === 'in-progress'
                        ? 'bg-yellow-50 border-yellow-200'
                        : getStepStatus(selectedCollege.applicationStatus) === 'rejected'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {getStepStatus(selectedCollege.applicationStatus) === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : getStepStatus(selectedCollege.applicationStatus) === 'in-progress' ? (
                          <Clock className="w-4 h-4 text-yellow-600" />
                        ) : getStepStatus(selectedCollege.applicationStatus) === 'rejected' ? (
                          <Circle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <h3 className="text-gray-900">Application</h3>
                      </div>
                      <p className={`${
                        getStepStatus(selectedCollege.applicationStatus) === 'completed' 
                          ? 'text-green-700'
                          : getStepStatus(selectedCollege.applicationStatus) === 'in-progress'
                          ? 'text-yellow-700'
                          : getStepStatus(selectedCollege.applicationStatus) === 'rejected'
                          ? 'text-red-700'
                          : 'text-gray-600'
                      }`}>
                        {selectedCollege.applicationStatus || 'Not Started'}
                      </p>
                    </div>

                    {/* Essay Step */}
                    <div className={`p-3 rounded-lg border-2 transition-all ${
                      getStepStatus(selectedCollege.essayStatus) === 'completed' 
                        ? 'bg-green-50 border-green-200'
                        : getStepStatus(selectedCollege.essayStatus) === 'in-progress'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {getStepStatus(selectedCollege.essayStatus) === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : getStepStatus(selectedCollege.essayStatus) === 'in-progress' ? (
                          <Clock className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <h3 className="text-gray-900">Essay</h3>
                      </div>
                      <p className={`${
                        getStepStatus(selectedCollege.essayStatus) === 'completed' 
                          ? 'text-green-700'
                          : getStepStatus(selectedCollege.essayStatus) === 'in-progress'
                          ? 'text-yellow-700'
                          : 'text-gray-600'
                      }`}>
                        {selectedCollege.essayStatus || 'Not Started'}
                      </p>
                    </div>

                    {/* Recommendations Step */}
                    <div className={`p-3 rounded-lg border-2 transition-all ${
                      getStepStatus(selectedCollege.recommendationStatus) === 'completed' 
                        ? 'bg-green-50 border-green-200'
                        : getStepStatus(selectedCollege.recommendationStatus) === 'in-progress'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {getStepStatus(selectedCollege.recommendationStatus) === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : getStepStatus(selectedCollege.recommendationStatus) === 'in-progress' ? (
                          <Clock className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-400" />
                        )}
                        <h3 className="text-gray-900">Recommendations</h3>
                      </div>
                      <p className={`${
                        getStepStatus(selectedCollege.recommendationStatus) === 'completed' 
                          ? 'text-green-700'
                          : getStepStatus(selectedCollege.recommendationStatus) === 'in-progress'
                          ? 'text-yellow-700'
                          : 'text-gray-600'
                      }`}>
                        {selectedCollege.recommendationStatus || 'Not Started'}
                      </p>
                    </div>
                  </div>

                  {/* Deadline Info */}
                  {selectedCollege.deadline && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Deadline: <strong>{new Date(selectedCollege.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100 text-center">
                  <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h2 className="text-gray-900 mb-1.5">Select a College</h2>
                  <p className="text-gray-600">Click on a college card above to view its application progress</p>
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* Notes Modal */}
      {notesOpen && selectedCollege && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-3">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <div>
                <h2 className="text-gray-900 mb-0.5">My Notes</h2>
                <p className="text-gray-600 text-sm truncate">{selectedCollege.name ?? selectedCollege.INSTNM}</p>
              </div>
              <button
                onClick={() => setNotesOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close notes"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveNotes} className="p-4 space-y-3">
              <div>
                <label htmlFor="noteContent" className="block text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="noteContent"
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all resize-none"
                  placeholder="Add reminders, interview tips, or links..."
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
                  onClick={() => setNotesOpen(false)}
                >
                  Close
                </button>
                <div className="flex gap-2 justify-end w-full sm:w-auto">
                  <button
                    type="button"
                    className="px-3 py-1.5 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-60"
                    onClick={handleDeleteNotes}
                    disabled={savingNote || !noteDraft}
                  >
                    Delete
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-60"
                    disabled={savingNote}
                  >
                    {savingNote ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && deleteConfirm.college && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-4">Are you sure you want to delete <strong>{deleteConfirm.college.name}</strong> from your dashboard?</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                onClick={confirmDelete}
                disabled={deletingId === deleteConfirm.college._id}
              >
                {deletingId === deleteConfirm.college._id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
