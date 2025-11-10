import React from "react";
import "./TopBar.css";

type TopBarProps = {
  onSignIn?: () => void; // optional hook-up later
};

export default function TopBar({ onSignIn }: TopBarProps) {
  return (
    <header className="topbar" role="banner">
      <div className="topbar__inner">
        <div className="topbar__left">
          <a href="/CollegeApplicationTracker" className="topbar__brand" aria-label="College Application Tracker Home">
            College Application Tracker
          </a>
        </div>

        <div className="topbar__right">
          <button
            className="topbar__button"
            type="button"
            onClick={onSignIn}
            aria-label="Sign in"
          >
            Sign In
          </button>
        </div>
      </div>
    </header>
  );
}
