import { Link, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RecipesPage from "./pages/recipesPage";
import WeeklyMenuPage from "./pages/WeeklyMenuPage";

export default function App() {
  return (
    <div>
      <header style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
        <h1>RecipeVault</h1>
        <nav style={{ display: "flex", gap: "1rem" }}>
          <Link to="/">Home</Link>
          <Link to="/recipes">Recipes</Link>
          <Link to="/weekly-menu">Weekly Menu</Link>
        </nav>
      </header>

      <main style={{ padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/weekly-menu" element={<WeeklyMenuPage />} />
        </Routes>
      </main>
    </div>
  );
}
