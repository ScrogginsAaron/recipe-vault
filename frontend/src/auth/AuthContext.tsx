import { createContext, useContext, useMemo, useState } from "react";

type AuthContextType = {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user?: unknown) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  function login(newToken: string, user?: unknown) {
    localStorage.setItem("token", newToken);

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
  }

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}