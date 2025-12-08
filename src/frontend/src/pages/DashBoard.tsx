import React, { useRef, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./DashBoard.css";
import { useAuth } from "../auth/AuthProvider";

type College = {
  _id: string;
  INSTNM?: string;
  CITY?: string;
  STABBR?: string;
  name?: string;
  location?: string;
};

export default function DashBoard() {
  const location = useLocation();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { user, loading } = useAuth();

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
      if (!user) {
        setColleges([]);
        return;
      }
      try {
        const token = await user.getIdToken();
        const res = await fetch("http://localhost:4000/api/saved", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to load saved colleges: ${res.status}`);
        }

        const payload = await res.json();
        const list = Array.isArray(payload) ? payload : payload.data;
        setColleges(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load saved colleges", err);
        setColleges([]);
      }
    };

    loadSaved();
  }, [user]);


  return (
    <main className="dash">
      <section className="dash__header">
        <h1 className="dash__title">Your Colleges</h1>
        <div className="dash__actions">
          <Link to="/colleges" className="btn">Browse Schools</Link>
        </div>
      </section>

      {!loading && !user && (
        <p>Please sign in to view your saved colleges.</p>
      )}

      <div className="carouselWrapper">
        <button className="scrollBtn left" onClick={scrollLeft}>❮</button>
        <button className="scrollBtn right" onClick={scrollRight}>❯</button>

        <section className="dash__row" ref={scrollerRef}>
          {colleges.map((c) => (
            <article className="card" key={c._id}>
              <header className="card__header">
                <span className="card__emoji">🎓</span>
                <h2 className="card__name">{c.name ?? c.INSTNM}</h2>
              </header>

              <dl className="card__facts">
                <div>
                  <dt>City/State</dt>
                  <dd>{c.location ?? [c.CITY, c.STABBR].filter(Boolean).join(", ")}</dd>
                </div>
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
