import { 
  useEffect, 
  useMemo, 
  useState 
} from "react";
import {
  getRecipes,
  searchRecipesByIngredient,
  searchRecipesByName,
  type Recipe,
} from "../api/recipes";
import "./RecipesPage.css";

type SearchMode = "name" | "ingredient";

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("name");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    async function loadRecipes() {
      try {
        setLoading(true);
        setError("");

        if (trimmedQuery) {
          const response =
            searchMode === "name" 
              ? await searchRecipesByName(trimmedQuery)
              : await searchRecipesByIngredient(trimmedQuery);

          setRecipes(response.data);
          setTotalPages(1);
          return;
        }

        const response = await getRecipes(page, 12);
        setRecipes(response.data);
        setTotalPages(response.pagination?.totalPages ?? 1);
      } catch (err) {
        console.error(err);
        setError("Failed to load recipes.");
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    }

    loadRecipes();
  }, [page, trimmedQuery, searchMode]);

  useEffect(() => {
    setPage(1);
  }, [trimmedQuery, searchMode ]);

  return (
    <section className="recipes-page">
      <div className="recipes-hero">
        <div>
          <span className="recipes-eyebrow">Recipe Library</span>
          <h2 className="recipes-title">Browse and search your recipes</h2>
          <p className="recipes-subtitle">
            Search by recipe name or ingredient, then explore your saved recipe collection.
          </p>
        </div>

        <div className="recipes-controls">
          <div className="control-group">
            <label htmlFor="searchMode">Search by</label>
            <select
              id="searchMode"
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value as SearchMode)}
            >
              <option value="name">Recipe name</option>
              <option value="ingredient">Ingredient</option>
            </select>
          </div>
 
          <div className="control-group recipe-search-group">
            <label htmlFor="recipeSearch">Search</label>
            <input
              id="recipeSearch"
              type="text"
              placeholder={
                searchMode === "name"
                  ? "Search recipes by name..."
                  : "Search recipes by ingredient..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
 
      {error && <div className="status-banner error">{error}</div>}

      {loading ? (
        <div className="recipe-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div className="recipe-card skeleton-card" key={index}>
              <div className="skeleton-line skeleton-sm" />
              <div className="skeleton-line" />
              <div className="skeleton-line skeleton-lg" />
            </div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <h3>No recipes found</h3>
          <p>
            {trimmedQuery
              ? "Try a different search term."
              : "Add recipes to start building your collection."}
          </p>
        </div>
      ) : (
        <>
          <div className="recipe-grid">
            {recipes.map((recipe) => (
              <article key={recipe.id} className="recipe-card">
                <div className="recipe-card-header">
                  <h3>{recipe.name}</h3>
                </div>

                {recipe.description && (
                  <p className="recipe-description">{recipe.description}</p>
                )}
                
                <div className="recipe-card-actions">
                  <button 
                    type="button"
                    className="secondary-button"
                  >
                    View Recipe
                  </button>
                </div>
              </article>
            ))}
          </div>

          {!trimmedQuery && totalPages > 1 && (
            <div className="pagination-row">
              <button
                type="button"
                className="secondary-button"
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                Previous
              </button>

              <span className="pagination-text">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                className="secondary-button"
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}