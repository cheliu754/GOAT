import React, { useEffect, useState } from "react";
import "./TopBar.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../auth/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

type SimpleUser = {
  name: string | null;
  email: string | null;
};

export default function TopBar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser({
          name: fbUser.displayName,
          email: fbUser.email,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInClick = () => {
    navigate("/signin");
  };

  const handleSignOutClick = async () => {
    await signOut(auth);
    // 退出后可以回首页（可选）
    navigate("/");
  };

  const displayName = user?.name || user?.email || "User";

  return (
    <header className="topbar" role="banner">
      <div className="topbar__inner">
        <div className="topbar__left">
          <a
            href="/CollegeApplicationTracker"
            className="topbar__brand"
            aria-label="College Application Tracker Home"
          >
            College Application Tracker
          </a>
        </div>

        <div className="topbar__right">
          {loading ? (
            <span className="topbar__user">Checking session...</span>
          ) : user ? (
            <>
              <span className="topbar__user">Hi, {displayName}</span>
              <button
                className="topbar__button"
                type="button"
                onClick={handleSignOutClick}
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              className="topbar__button"
              type="button"
              onClick={handleSignInClick}
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
