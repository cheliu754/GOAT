import React, { useState } from "react";
import SearchBar, { Suggestion } from "../components/SearchBar";
import "./Colleges.css";

type College = {
  _id: string;
  INSTNM: string;
  CITY: string;
  STABBR: string;
};

export default function Colleges() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<College[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  // When user types
  const handleChange = async (value: string) => {
    setQuery(value);

    if (!value.trim()) {
      setRows([]);
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:4000/api/colleges/search?q=${encodeURIComponent(value)}`
      );
      const data = await res.json();

      // Update table rows
      setRows(data);

      // Dropdown suggestions
      setSuggestions(
        data.slice(0, 8).map((c: College) => ({
          id: c._id,
          label: c.INSTNM,
          value: c.INSTNM,
        }))
      );
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  // When submitting (press Enter or Search button)
  const handleSubmit = (value: string) => {
    handleChange(value);
  };

  const handleAdd = (college: College) => {
    alert(`Added "${college.INSTNM}"`);
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
                  onClick={() => handleAdd(c)}
                >
                  Add
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
