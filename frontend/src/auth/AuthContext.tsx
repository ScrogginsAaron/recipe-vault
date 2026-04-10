import { 
  createContext, 
  useContext, 
  useEffect,
  useMemo, 
  useState 
} from "react";
import {
  getCurrentUser,
  type AuthUser
} from "../api/auth";

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (token: string, user?: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? (JSON.parse(saved) as AuthUser) : null;
    } catch {
      return null;
    }
  });  
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(token));

  useEffect(() => {
    async function hydrateUser() {
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
      } catch (error) {
        console.error("Failed to hydrate user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    }
 
    hydrateUser();
  }, [token]);

  function login(newToken: string, newUser?: AuthUser) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setIsAuthLoading(false);

    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
      setUser(newUser);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsAuthLoading(false);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isAuthLoading,
      login,
      logout,
    }),
    [token, user, isAuthLoading]
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