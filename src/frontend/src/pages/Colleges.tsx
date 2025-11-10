import React, { useMemo, useState } from "react";
import SearchBar from "../components/SearchBar";
import "./Colleges.css";

type CollegeRow = {
  id: string;
  name: string;
  city: string;
  state: string;
};

// hardcoded demo data
const ALL_COLLEGES: CollegeRow[] = [
  { id: "mit",      name: "Massachusetts Institute of Technology", city: "Cambridge", state: "MA" },
  { id: "stanford", name: "Stanford University",                   city: "Stanford",  state: "CA" },
  { id: "harvard",  name: "Harvard University",                    city: "Cambridge", state: "MA" },
  { id: "cmu",      name: "Carnegie Mellon University",            city: "Pittsburgh",state: "PA" },
  { id: "berkeley", name: "University of California, Berkeley",    city: "Berkeley",  state: "CA" },
  { id: "ucla",     name: "University of California, Los Angeles", city: "Los Angeles", state: "CA" },
  { id: "uiuc",     name: "University of Illinois Urbana-Champaign", city: "Champaign", state: "IL" },
  { id: "umich",    name: "University of Michigan",                city: "Ann Arbor", state: "MI" },
];

export default function Colleges() {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_COLLEGES;
    return ALL_COLLEGES.filter((c) =>
      [c.name, c.city, c.state].some((f) => f.toLowerCase().includes(q))
    );
  }, [query]);

  const handleSubmit = (v: string) => setQuery(v);
  const handleChange = (v: string) => setQuery(v);

  const handleAdd = (row: CollegeRow) => {
    // TODO: wire to your data store later
    console.log("Add to user record:", row);
    alert(`Added "${row.name}" (demo)`);
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
            suggestions={ALL_COLLEGES.map((c) => ({ id: c.id, label: c.name }))}
            debounceMs={250}
          />
        </div>
      </header>

      <section className="table" role="table" aria-label="Colleges">
        <div className="table__header" role="row">
          <div className="th" role="columnheader">Name</div>
          <div className="th" role="columnheader">City</div>
          <div className="th" role="columnheader">State</div>
          <div className="th th--actions" role="columnheader">Action</div>
        </div>

        <div className="table__body">
          {rows.map((r) => (
            <div key={r.id} className="tr" role="row">
              <div className="td" role="cell">{r.name}</div>
              <div className="td" role="cell">{r.city}</div>
              <div className="td" role="cell">{r.state}</div>
              <div className="td td--actions" role="cell">
                <button className="btn btn--outline" onClick={() => handleAdd(r)} type="button">
                  Add
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="tr tr--empty" role="row">
              <div className="td td--empty" role="cell" col-span={4}>
                No results for “{query}”.
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
