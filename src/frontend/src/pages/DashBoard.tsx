import React, { useRef, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./DashBoard.css";

type College = {
  _id: string;
  INSTNM: string;
  CITY: string;
  STABBR: string;
};

export default function DashBoard() {
  const location = useLocation();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const [colleges, setColleges] = useState<College[]>([]);

  const scrollByAmount = 340;

  const scrollLeft = () => {
    scrollerRef.current?.scrollBy({ left: -scrollByAmount, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollerRef.current?.scrollBy({ left: scrollByAmount, behavior: "smooth" });
  };

  useEffect(() => {
  const loadSaved = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/saved");
      const data = await res.json();
      setColleges(data);
    } catch (err) {
      console.error("Failed to load saved colleges", err);
    }
  };

  loadSaved();
}, []);


  return (
    <main className="dash">
      <section className="dash__header">
        <h1 className="dash__title">Your Colleges</h1>
        <div className="dash__actions">
          <Link to="/colleges" className="btn">Browse Schools</Link>
        </div>
      </section>

      <div className="carouselWrapper">
        <button className="scrollBtn left" onClick={scrollLeft}>❮</button>
        <button className="scrollBtn right" onClick={scrollRight}>❯</button>

        <section className="dash__row" ref={scrollerRef}>
          {colleges.map((c) => (
            <article className="card" key={c._id}>
              <header className="card__header">
                <span className="card__emoji">🎓</span>
                <h2 className="card__name">{c.INSTNM}</h2>
              </header>

              <dl className="card__facts">
                <div><dt>City</dt><dd>{c.CITY}</dd></div>
                <div><dt>State</dt><dd>{c.STABBR}</dd></div>
              </dl>

              <div className="card__actions">
                <Link
  to="/update"
  state={{ backgroundLocation: location, school: c }}
  className="btn btn--outline"
>
  Update
</Link>

              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
