// src/pages/SignIn.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../auth/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import "./SignIn.css";

export default function SignIn() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // once auth is successful, go back to "/"
      if (currentUser) {
        navigate("/", { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleOAuthSignIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const displayName = user?.displayName || user?.email;

  return (
    <div className="signin-page">
      <div className="signin-card">
        <h1 className="signin-title">Sign in to College Application Tracker</h1>

        {loading ? (
          <p>Checking login state...</p>
        ) : user ? (
          <>
            <p>Hi, {displayName}</p>
            <button onClick={handleSignOut} className="signin-oauth-button">
              Sign Out
            </button>
          </>
        ) : (
          <button onClick={handleOAuthSignIn} className="signin-oauth-button">
            Continue with Google Account
          </button>
        )}
      </div>
    </div>
  );
}
