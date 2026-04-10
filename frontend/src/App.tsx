import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RecipesPage from "./pages/RecipesPage";
import WeeklyMenuPage from "./pages/WeeklyMenuPage";
import RegisterPage from "./pages/RegisterPage";
import PublicOnlyRoute from "./auth/PublicOnlyRoute";
import logo from "./assets/recipe-vault-logo.png";
import "./App.css";

export default function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <img src={logo} alt="RecipeVault logo" className="brand-logo" />
          <div>
            <h1 className="brand-title">RecipeVault</h1>
            <p className="brand-subtitle">Plan smarter, cook easier</p>
          </div>
        </div>

        <nav className="top-nav">
          <NavLink to="/" className="nav-link">
            Home
          </NavLink>
          <NavLink to="/recipes" className="nav-link">
            Recipes
          </NavLink>
          <NavLink to="/weekly-menu" className="nav-link">
            Weekly Menu
          </NavLink>

          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className="nav-link">
                Login
              </NavLink>
              <NavLink to="/register" className="nav-link nav-button">
                Register
              </NavLink>
            </>
          ) : (
            <div className="auth-actions">
              <span className="user-pill">
                {user?.email ?? "Logged in"}
              </span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          )}
        </nav>
      </header>

      <main className="app-main">
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
