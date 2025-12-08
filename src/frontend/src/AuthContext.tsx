import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { API_BASE, apiPost } from "./lib/api";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => {
      setUser(u ?? null);
      setLoading(false);
    });
    return () => off();
  }, []);

  useEffect(() => {
    const syncUser = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        await apiPost(`${API_BASE}/api/users/sync`, {
          name: user.displayName ?? null,
          email: user.email ?? null,
        }, token);
      } catch (err) {
        console.error("User sync failed", err);
      }
    };

    syncUser();
  }, [user]);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
