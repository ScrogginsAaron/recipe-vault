import { useMemo, useState } from "react";
import { generateWeeklyMenu } from "../api/menu";
import type { WeeklyMenuResponse } from "../types/menu";
import "./WeeklyMenuPage.css";

type SourceOption = "all" | "favorites";

function formatDisplayDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);

  return localDate.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function WeeklyMenuPage() {
  const [data, setData] = useState<WeeklyMenuResponse["data"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [source, setSource] = useState<"all" | "favorites">("all");
  const [days, setDays] = useState(7);
  const [startDate, setStartDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  async function handleGenerate() {
    try {
      setLoading(true);
      setError("");
 
      const response = await generateWeeklyMenu(source, days, startDate);
      setData(response.data);
    } catch (err) {
      setError("Failed to generate weekly menu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const totalIngredients = useMemo(() => {
    return data?.ingredientsSummary.length ?? 0;
  }, [data]);

  const emptyFavoritesState = 
    source === "favorites" && !loading && !data && !error;

  return (
    <section className="weekly-menu-page">
      <div className="weekly-hero">
        <div className="weekly-hero-copy">
          <span className="weekly-eyebrow">Meal Planning</span>
          <h2 className="weekly-title">Build your weekly menu in seconds</h2>
          <p className="weekly-subtitle">
            Choose from all recipes or only your favorites, then review your daily meals and combined ingredient list in one place.
          </p>
        </div>

        <div className="weekly-controls-card">
          <div className="control-group">
            <label htmlFor="source">Recipe source</label>
            <select
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value as SourceOption)}
            >
              <option value="all">All recipes</option>
              <option value="favorites">Favorites only</option>
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="days">Number of days</label>
            <select
              id="days"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
            >
              <option value={1}>1 day</option>
              <option value={3}>3 days</option>
              <option value={5}>5 days</option>
              <option value={7}>7 days</option>
            </select>
          </div>
      
          <div className="control-group">
            <label htmlFor="startDate">Start date</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="generate-button"
          >
            {loading ? "Generating..." : "Generate Menu"}
          </button>
        </div>
      </div>

      {error && <div className="status-banner error">{error}</div>}

      {emptyFavoritesState && (
        <div className="empty-state">
        <h3>No favorites yet</h3>
        <p>
          Once you add favorite recipes, you'll be able to generate a weekly plan from them here.
        </p>
      </div>
    )}

    {!data && !loading && source !== "favorites" && !error && (
      <div className="empty-state">
        <h3>No menu generated yet</h3>
        <p>Select your options and generate a weekly plan to get started.</p>
      </div>
    )}

    {loading && (
      <div className="weekly-content">
        <div className="menu-panel">
          <div className="section-heading">
            <h3>Weekly Menu</h3>
            <span>Loading meals...</span>
          </div>
 
          <div className="day-grid">
            {Array.from({ length: days }).map((_, index) => (
              <div className="day-card skeleton-card" key={index}>
                <div className="skeleton-line skeleton-sm" />
                <div className="skeleton-line" />
                <div className="skeleton-line" />
                <div className="skeleton-line skeleton-lg" />
              </div>
            ))}
          </div>
        </div>

        <aside className="ingredients-panel">
          <div className="section-heading">
            <h3>Ingredient Summary</h3>
            <span>Loading...</span>
          </div>

          <div className="ingredient-list-card skeleton-card">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line skeleton-lg" />
          </div>
        </aside>
      </div>
    )}

    {data && !loading && (
      <div className="weekly-content">
        <div className="menu-panel">
          <div className="section-heading">
            <h3>Weekly Menu</h3>
            <span>{data.menu.length} days planned</span>
          </div>

          <div className="day-grid">
            {data.menu.map((day) => (
              <article key={day.day} className="day-card">
                <div className="day-card-header">
                  <span className="day-badge">{day.day}</span>
                </div>

                <p className="day-date">{formatDisplayDate(day.date)}</p>

                <div className="meal-block breakfast">
                  <div className="meal-label">Breakfast</div>
                  <div className="meal-name">{day.meals.breakfast.name}</div>
                </div>

                <div className="meal-block lunch">
                  <div className="meal-label">Lunch</div>
                  <div className="meal-name">{day.meals.lunch.name}</div>
                </div>

                <div className="meal-block dinner">
                  <div className="meal-label">Dinner</div>
                  <div className="meal-name">{day.meals.dinner.name}</div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="ingredients-panel">
          <div className="section-heading">
            <h3>Ingredient Summary</h3>
            <span>{totalIngredients} items</span>
          </div>

          <div className="ingredient-list-card">
            {data.ingredientsSummary.length === 0 ? (
              <p className="muted-text">No combined ingredients available.</p>
            ) : (
              data.ingredientsSummary.map((item) => (
                <div key={item.name} className="ingredient-row">
                  <div>
                    <p className="ingredient-name">{item.name}</p>
                    {item.notes && item.notes.length > 0 && (
                      <p className="ingredient-notes">
                        {item.notes.join(", ")}
                      </p>
                    )}
                  </div>

                  <span className="ingredient-total">
                    {item.totalQuantity ?? "Could not combine"}
                  </span>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    )}
    </section>
  );
}