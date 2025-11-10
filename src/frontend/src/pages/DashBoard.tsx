import React, { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./DashBoard.css";

type College = {
  id: string;
  name: string;
  deadline: string;
  progress: number;
  tasksDone: number;
  tasksTotal: number;
  status: "Not started" | "In progress" | "Submitted" | "Deferred";
};

const COLLEGES: College[] = [
  { id: "mit",      name: "MIT",             deadline: "Jan 1",  progress: 40,  tasksDone: 4,  tasksTotal: 10, status: "In progress" },
  { id: "stanford", name: "Stanford",        deadline: "Dec 5",  progress: 90,  tasksDone: 9,  tasksTotal: 10, status: "In progress" },
  { id: "harvard",  name: "Harvard",         deadline: "Jan 5",  progress: 65,  tasksDone: 13, tasksTotal: 20, status: "In progress" },
  { id: "cmu",      name: "Carnegie Mellon", deadline: "Dec 15", progress: 20,  tasksDone: 2,  tasksTotal: 10, status: "Not started" },
  { id: "berkeley", name: "UC Berkeley",     deadline: "Nov 30", progress: 100, tasksDone: 12, tasksTotal: 12, status: "Submitted" },
];

export default function DashBoard() {
  const location = useLocation();
  const scrollerRef = useRef<HTMLDivElement>(null);

  // scroll ~ one card at a time
  const scrollByAmount = 340;

  const scrollLeft = () => {
    scrollerRef.current?.scrollBy({ left: -scrollByAmount, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollerRef.current?.scrollBy({ left: scrollByAmount, behavior: "smooth" });
  };

  return (
    <main className="dash">
      <section className="dash__header">
        <h1 className="dash__title">Your Colleges</h1>
        <div className="dash__actions">
          <Link to="/colleges" className="btn">Browse Schools</Link>
        </div>
      </section>

      <div className="carouselWrapper">
        <button className="scrollBtn left" onClick={scrollLeft} aria-label="Scroll left">❮</button>
        <button className="scrollBtn right" onClick={scrollRight} aria-label="Scroll right">❯</button>

        <section className="dash__row" ref={scrollerRef} aria-label="Colleges list">
          {COLLEGES.map((c) => (
            <article className="card" key={c.id}>
              <header className="card__header">
                <span className="card__emoji" aria-hidden>🎓</span>
                <h2 className="card__name">{c.name}</h2>
              </header>

              <dl className="card__facts">
                <div><dt>Deadline</dt><dd>{c.deadline}</dd></div>
                <div><dt>Progress</dt><dd>{c.progress}%</dd></div>
                <div><dt>Tasks</dt><dd>{c.tasksDone}/{c.tasksTotal}</dd></div>
                <div><dt>Status</dt><dd>{c.status}</dd></div>
              </dl>

              <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={c.progress}>
                <div className="progress__bar" style={{ width: `${c.progress}%` }} />
              </div>

              <div className="card__actions">
                <Link
                  to="/update"
                  state={{ backgroundLocation: location }}
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
