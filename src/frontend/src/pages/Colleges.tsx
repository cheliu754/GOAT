import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchBar, { Suggestion } from "../components/SearchBar";
import "./Colleges.css";
import { useAuth } from "../auth/AuthProvider"; // TODO(auth)

type College = {
  _id: string;
  INSTNM: string;
  CITY: string;
  STABBR: string;
  SAVED?: boolean;
};

export default function Colleges() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<College[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const uid = user?.uid ?? null;

  const handleChange = async (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      setRows([]);
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:4000/api/colleges/search?q=${encodeURIComponent(
          value
        )}&uid=${uid ?? ""}`
      );
      const data: College[] = await res.json();

      setRows(data);

      setSuggestions(
        data.slice(0, 8).map((c) => ({
          id: c._id,
          label: c.INSTNM,
          value: c.INSTNM,
        }))
      );
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const handleSubmit = (value: string) => {
    handleChange(value);
  };

  const handleAddOrUpdate = async (college: College) => {
    if (!user) {
      navigate("/signin");
      return;
    }

    if (college.SAVED) {
      navigate("/update", {
        state: { backgroundLocation: location, school: college },
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          INSTNM: college.INSTNM,
          CITY: college.CITY,
          STABBR: college.STABBR,
        }),
      });

      if (!res.ok) throw new Error("Failed to add");

      const updated = { ...college, SAVED: true };
      setRows((prev) =>
        prev.map((c) => (c._id === college._id ? updated : c))
      );

      navigate("/update", {
        state: { backgroundLocation: location, school: updated },
      });
    } catch (err) {
      console.error("Add failed:", err);
    }
  };

  return (
    <main className="colleges">
      <header className="colleges__head">
        <h1 className="colleges__title">Colleges</h1>

        <div className="colleges__searchwrap">
          <SearchBar
            placeholder="Search by name, city, or state…"
            onChange={handleChange}
            onSubmit={handleSubmit}
            suggestions={suggestions}
            debounceMs={250}
          />
        </div>
      </header>

      <section className="table">
        <div className="table__header">
          <div className="th">Name</div>
          <div className="th">City</div>
          <div className="th">State</div>
          <div className="th th--actions">Action</div>
        </div>

        <div className="table__body">
          {rows.map((c) => (
            <div key={c._id} className="tr">
              <div className="td">{c.INSTNM}</div>
              <div className="td">{c.CITY}</div>
              <div className="td">{c.STABBR}</div>

              <div className="td td--actions">
                <button
                  className="btn btn--outline"
                  type="button"
                  onClick={() => handleAddOrUpdate(c)}
                >
                  {c.SAVED ? "Update" : "Add"}
                </button>
              </div>
            </div>
          ))}

          {rows.length === 0 && query && (
            <div className="tr tr--empty">
              <div className="td td--empty">
                No results for “{query}”.
              </div>
            </div>
          )}
        </div>

      </section>
    </main>
  );
}
