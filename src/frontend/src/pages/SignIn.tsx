import React, { useState, useEffect } from "react";
import { auth } from "../auth/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import "./SignIn.css";

export default function SignIn() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOAuthSignIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);  // 触发 OAuth2.0 登录
  };

  const handleSignOut = async () => {
    await signOut(auth);  // 退出登录
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
