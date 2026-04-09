import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RecipesPage from "./pages/recipesPage";
import WeeklyMenuPage from "./pages/WeeklyMenuPage";
import RegisterPage from "./pages/RegisterPage";
import PublicOnlyRoute from "./auth/PublicOnlyRoute";

export default function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div>
      <header style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
        <h1>RecipeVault</h1>

        <nav style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link to="/">Home</Link>
          <Link to="/recipes">Recipes</Link>
          <Link to="/weekly-menu">Weekly Menu</Link>
          {!isAuthenticated ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          ) : (
            <>
              <span>
                {user?.email ?? "Logged in"}
              </span>
              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </nav>
      </header>

      <main style={{ padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/login" 
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            } 
          />
          <Route 
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            } 
          />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route 
            path="/weekly-menu"
            element={
              <ProtectedRoute>
                <WeeklyMenuPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
