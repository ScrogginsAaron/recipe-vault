import { useState } from "react";
import { generateWeeklyMenu } from "../api/menu";
import type { WeeklyMenuResponse } from "../types/menu";

export default function WeeklyMenuPage() {
  const [data, setData] = useState<WeeklyMenuResponse["data"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    try {
      setLoading(true);
      setError("");
 
      const response = await generateWeeklyMenu("all", 7);
      setData(response.data);
    } catch (err) {
      setError("Failed to generate weekly menu.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h2>Weekly Menu</h2>

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate Weekly Menu"}
      </button>
      
      {error && <p>{error}</p>}

      {data && (
        <>
          <h3>Menu</h3>
          {data.menu.map((day) => (
            <div
              key={day.day}
              style={{
                border: "1px solid #ddd",
                padding: "1rem",
                marginTop: "1rem",
                borderRadius: "8px",
              }}
            >
              <h4>{day.day}</h4>
              <p>
                <strong>Breakfast:</strong> {day.meals.breakfast.name}
              </p>
              <p>
                <strong>Lunch:</strong> {day.meals.lunch.name}
              </p>
              <p>
                <strong>Dinner:</strong> {day.meals.dinner.name}
              </p>
            </div>
          ))}

          <h3 style={{ marginTop: "2rem" }}>Ingredient Summary</h3>
          {data.ingredientsSummary.map((item) => (
            <div
              key={item.name}
              style={{
                borderBottom: "1px solid #eee",
                padding: "0.75rem 0",
              }}
            >
              <p>
                <strong>{item.name}</strong>
              </p>
              <p>Total: {item.totalQuantity ?? "Could not combine"}</p>
              {item.notes && item.notes.length > 0 && (
                <p>Notes: {item.notes.join(", ")}</p>
              )}
            </div>
          ))}
        </>
      )}
    </section>
  );
}