import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import { useAuth } from "../AuthContext";
import { apiGet, apiPost } from "../lib/api";
import { toast } from "sonner@2.0.3";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

type College = {
  _id: string;
  INSTNM?: string;
  CITY?: string;
  STABBR?: string;
  ZIP?: string;
  INSTURL?: string;
  name?: string;
  location?: string;
  acceptanceRate?: string | null;
  ADM_RATE?: number;
  SAT_AVG?: number;
};

export default function Colleges() {
  const [searchQuery, setSearchQuery] = useState("");
  const [colleges, setColleges] = useState<College[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedRecords, setSavedRecords] = useState<{ name?: string; INSTNM?: string; _id: string }[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Guards against stale responses
  const searchVersionRef = useRef(0);

  const fetchColleges = useCallback(
    async (query?: string, letter?: string | null) => {
      const thisVersion = ++searchVersionRef.current;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (query?.trim()) params.set("q", query.trim());
        if (letter) params.set("letter", letter);
        params.set("limit", "200");

        const res = await apiGet<{ success: boolean; data: College[]; total?: number }>(
          `/api/colleges${params.toString() ? `?${params.toString()}` : ""}`
        );

        // If a newer search started after this one, ignore the result
        if (thisVersion !== searchVersionRef.current) return;

        setColleges(res?.data || []);
      } catch (err: any) {
        console.error("Load colleges failed", err);
        if (thisVersion !== searchVersionRef.current) return;
        setError(err?.message || "Failed to load colleges");
        setColleges([]);
      } finally {
        if (thisVersion === searchVersionRef.current) {
          setLoading(false);
        }
      }
    },
    []
  );

  // initial load
  useEffect(() => {
    fetchColleges();
  }, [fetchColleges]);

  useEffect(() => {
    const loadSaved = async () => {
      if (!user) {
        setSavedRecords([]);
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await apiGet<{ success: boolean; data: any[] }>("/api/saved", token);
        setSavedRecords(res?.data || []);
      } catch (err) {
        console.warn("Load saved list failed", err);
        setSavedRecords([]);
      }
    };
    loadSaved();
  }, [user]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedLetter(null);              // always clear letter when text search
    fetchColleges(query, null);
  };

  const handleLetterClick = (letter: string) => {
    // Clear text query when using alphabet filter
    if (selectedLetter === letter) {
      setSelectedLetter(null);
      setSearchQuery("");
      fetchColleges();
    } else {
      setSelectedLetter(letter);
      setSearchQuery("");
      fetchColleges("", letter);
    }
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const handleSave = async (college: College) => {
    if (user) {
      try {
        setSavingId(college._id);
        const token = await user.getIdToken();
        await apiPost(
          "/api/saved",
          {
            name: college.name ?? college.INSTNM,
            INSTNM: college.INSTNM,
            location: college.location,
            CITY: college.CITY,
            STABBR: college.STABBR,
            website: college.INSTURL,
            applicationStatus: "Not Started",
            essayStatus: "Not Started",
            recommendationStatus: "Not Started",
          },
          token
        );
        setSavedRecords((prev) => [
          ...prev,
          { _id: college._id, name: college.name, INSTNM: college.INSTNM },
        ]);
        setColleges((prev) => prev.filter((item) => item._id !== college._id));
        toast.success(`Saved ${college.name ?? college.INSTNM} to your dashboard`);
      } catch (err: any) {
        console.error("Save college failed", err);
        toast.error(err?.message || "Failed to save college");
      } finally {
        setSavingId(null);
      }
      return;
    }
    setShowLoginDialog(true);
  };

  const acceptanceText = (c: College) =>
    c.acceptanceRate ||
    (typeof c.ADM_RATE === "number" ? `${(c.ADM_RATE * 100).toFixed(1)}%` : undefined);

  const satText = (c: College) =>
    typeof c.SAT_AVG === "number" && Number.isFinite(c.SAT_AVG)
      ? Math.round(c.SAT_AVG).toString()
      : undefined;
  const displayValue = (val?: string) => (val ? val : "N/A");
  const escapeRegExp = (val: string) => val.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const highlightText = (text?: string) => {
    if (!text) return text ?? "";
    const query = searchQuery.trim();
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegExp(query)})`, "ig");
    return text.split(regex).map((part, idx) =>
      idx % 2 === 1 ? (
        <mark key={idx} className="bg-yellow-200 px-0.5 rounded-sm">
          {part}
        </mark>
      ) : (
        <span key={idx}>{part}</span>
      )
    );
  };

  const scoreRelevance = useCallback(
    (c: College) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return 0;

      const name = (c.name ?? c.INSTNM ?? "").trim().toLowerCase();
      const cityState = [c.CITY, c.STABBR].filter(Boolean).join(" ").toLowerCase();
      const location = (c.location ?? cityState).trim().toLowerCase();

      const positionBonus = (text: string) => {
        const idx = text.indexOf(q);
        if (idx === -1) return 0;
        return idx === 0 ? 120 : Math.max(60 - idx, 8);
      };

      let score = 0;
      score += positionBonus(name);
      score += positionBonus(location);

      if (name === q) score += 200; // exact name match
      if (location === q) score += 120;

      if (name.includes(q)) score += Math.max(0, 80 - name.indexOf(q));
      if (location.includes(q)) score += Math.max(0, 40 - location.indexOf(q));

      return score;
    },
    [searchQuery]
  );

  const isSaved = useCallback(
    (c: College) => {
      const target = (c.name ?? c.INSTNM ?? "").trim().toLowerCase();
      if (!target) return false;
      return savedRecords.some(
        (s) => (s.name ?? s.INSTNM ?? "").trim().toLowerCase() === target
      );
    },
    [savedRecords]
  );

  const activeColleges = useMemo(() => {
    const filtered = colleges.filter((c) => !isSaved(c));
    if (!searchQuery.trim()) return filtered;
    return [...filtered].sort((a, b) => scoreRelevance(b) - scoreRelevance(a));
  }, [colleges, isSaved, scoreRelevance, searchQuery]);

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5">
      <section className="mb-4 sm:mb-5">
        <div className="mb-4">
          <h1 className="text-gray-900 mb-0.5">Browse Colleges</h1>
          <p className="text-gray-600">Search and explore colleges to add to your tracker</p>
        </div>

        {/* Desktop & Tablet: Search on left, Alphabet filter on right */}
        <div className="hidden md:block">
          {/* >= 1200px: Search and alphabet in one row with 40:60 ratio */}
          {/* < 1200px: Stack vertically with same width */}
          <div className="min-[1200px]:flex min-[1200px]:items-center min-[1200px]:gap-3 space-y-3 min-[1200px]:space-y-0">
            {/* Search Bar */}
            <div className="min-[1200px]:w-[40%] w-full [&>div]:max-w-none">
              <SearchBar
                placeholder="Search schools by name or location…"
                value={searchQuery}
                onChange={handleSearch}
                onSubmit={handleSearch}
                autoFocus
              />
            </div>

            {/* A-Z Letter Navigation */}
            <div className="min-[1200px]:w-[60%] w-full bg-white rounded-lg shadow-sm border border-gray-100 h-12 px-2 flex items-center">
              <div className="flex justify-between w-full">
                {alphabet.map((letter) => {
                  const hasColleges = true; // backend filtering handles the availability
                  const isSelected = selectedLetter === letter;
                  return (
                    <button
                      key={letter}
                      onClick={() => handleLetterClick(letter)}
                      disabled={!hasColleges}
                      className={`
                        w-7 h-7 rounded flex items-center justify-center text-sm
                        transition-all duration-200
                        ${
                          isSelected
                            ? "bg-indigo-600 text-white scale-125 font-bold shadow-md z-10"
                            : hasColleges
                            ? "bg-gray-50 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:scale-110"
                            : "bg-gray-50 text-gray-300 cursor-not-allowed"
                        }
                      `}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Only search bar, no alphabet navigation */}
        <div className="md:hidden">
          <SearchBar
            placeholder="Search schools by name or location…"
            value={searchQuery}
            onChange={handleSearch}
            onSubmit={handleSearch}
            autoFocus
          />
        </div>
      </section>

      {error && (
        <div className="mb-3 text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-3 text-gray-600">Loading colleges…</div>
      )}

      {/* List View - Desktop & Tablet */}
      <section className="hidden sm:block space-y-2">
        {activeColleges.map((college) => (
          <article
            key={college._id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-3 border border-gray-100"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎓</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h2 className="text-gray-900 leading-tight">
                      {highlightText(college.name ?? college.INSTNM)}
                    </h2>
                    <p className="text-gray-600 text-sm mt-0.5">
                      {highlightText(
                        college.location ??
                          [college.CITY, college.STABBR].filter(Boolean).join(", ")
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-gray-500 text-xs">Acceptance</div>
                      <div className="text-gray-900 text-sm">
                        {displayValue(acceptanceText(college))}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-500 text-xs">SAT Avg</div>
                      <div className="text-gray-900 text-sm">
                        {displayValue(satText(college))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleSave(college)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm whitespace-nowrap disabled:opacity-60"
                      disabled={savingId === college._id || isSaved(college)}
                    >
                      {savingId === college._id
                        ? "Saving…"
                        : isSaved(college)
                        ? "Saved"
                        : "Save to Dashboard"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* List View - Mobile */}
      <section className="sm:hidden space-y-2">
        {activeColleges.map((college) => (
          <article
            key={college._id}
            className="bg-white rounded-lg shadow-sm p-3 border border-gray-100"
          >
            <header className="mb-2 flex items-start gap-2">
              <span className="text-xl">🎓</span>
              <div className="flex-1 min-w-0">
                <h2 className="text-gray-900 leading-tight">
                  {highlightText(college.name ?? college.INSTNM)}
                </h2>
                <p className="text-gray-600 text-sm">
                  {highlightText(
                    college.location ??
                      [college.CITY, college.STABBR].filter(Boolean).join(", ")
                  )}
                </p>
              </div>
            </header>

            <dl className="mb-2 space-y-0.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Acceptance Rate</dt>
                <dd className="text-gray-900">
                  {displayValue(acceptanceText(college))}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">SAT Avg</dt>
                <dd className="text-gray-900">
                  {displayValue(satText(college))}
                </dd>
              </div>
            </dl>

            <button
              onClick={() => handleSave(college)}
              className="w-full px-2 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center text-sm disabled:opacity-60"
              disabled={savingId === college._id || isSaved(college)}
            >
              {savingId === college._id
                ? "Saving…"
                : isSaved(college)
                ? "Saved"
                : "Save to Dashboard"}
            </button>
          </article>
        ))}
      </section>

      {!loading && activeColleges.length === 0 && (
        <div className="text-center py-10 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500 mb-1">
            No colleges found matching "{searchQuery}"
          </p>
          <p className="text-gray-400">Try a different search term</p>
        </div>
      )}

      {/* Login Dialog */}
      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save College</AlertDialogTitle>
            <AlertDialogDescription>
              Please log in to save colleges to your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLoginDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate("/signin")}>
              Log In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );

}
