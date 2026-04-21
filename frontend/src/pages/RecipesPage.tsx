import { 
  useEffect, 
  useMemo, 
  useState,
  useCallback
} from "react";

import {
  createRecipe,
  updateRecipe,
  deleteRecipe,
  attachIngredientToRecipe,
  updateRecipeIngredientQuantity,
  removeIngredientFromRecipe,
  getRecipes,
  searchRecipesByIngredient,
  searchRecipesByName,
  type Recipe,
} from "../api/recipes";

import {
  getIngredients,
  createIngredient,
} from "../api/ingredients";

import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../api/favorites";

import RecipeDetailModal from "../components/RecipeDetailModal";

import RecipeFormModal, {
  type RecipeFormValues,
} from "../components/RecipeFormModal";

import { useAuth } from "../auth/AuthContext";

import "./RecipesPage.css";

type SearchMode = "name" | "ingredient";

async function ensureIngredientId(name: string) {
  const normalizedName = name.trim();

  const ingredientsResponse = await getIngredients();
  const existingIngredient = ingredientsResponse.data.find(
    (ingredient) => ingredient.name.toLowerCase() === normalizedName.toLowerCase()
  );

  if (existingIngredient) {
    return existingIngredient.id;
  }

  const createdIngredient = await createIngredient(normalizedName);
  return createdIngredient.data.id;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RecipesPage() {
  const { isAuthenticated } = useAuth();
 
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("name");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  const loadRecipes = useCallback(async () => {
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
  }, [page, trimmedQuery, searchMode]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  useEffect(() => {
    setPage(1);
  }, [trimmedQuery, searchMode ]);

  useEffect(() => {
    async function loadFavorites() {
      if (!isAuthenticated) {
        setFavoriteIds([]);
        return;
      }

      try {
        const response = await getFavorites();
        setFavoriteIds(response.data.map((recipe: Recipe) => recipe.id));
      } catch (err) {
        console.error(err);
      }
    }

    loadFavorites();
  }, [isAuthenticated]);

  async function handleCreateRecipe(values: RecipeFormValues) {
    try {
      setFormSaving(true);
      setError("");

      const recipeResponse = await createRecipe({
        name: values.name,
        description: values.description,
        mealTypes: values.mealTypes,
        instructions: values.instructions,
      });

      const createdRecipe = recipeResponse.data;

      for (const ingredient of values.ingredients) {
        const ingredientId = await ensureIngredientId(ingredient.name);
        await attachIngredientToRecipe(createdRecipe.id, {
          ingredientId,
          quantity: ingredient.quantity,
        });
      }

      setIsCreateModalOpen(false);
      await loadRecipes();
    } catch (err) {
      console.error(err);
      throw new Error("Failed to create recipe.");
    } finally {
      setFormSaving(false);
    }
  }

  async function syncRecipeIngredients(recipe: Recipe, nextIngredients: RecipeFormValues["ingredients"]) {
    const normalizedNextIngredients = nextIngredients
      .map((ingredient) => ({
        ...ingredient,
        name: ingredient.name.trim(),
        quantity: ingredient.quantity.trim(),
      }))
      .filter((ingredient) => ingredient.name && ingredient.quantity);

    const currentById = new Map(
      recipe.ingredients.map((ingredient) => [ingredient.id, ingredient])
    );

    const nextIds = new Set<string>();

    for (const ingredient of normalizedNextIngredients) {
      const ingredientId = ingredient.id ?? (await ensureIngredientId(ingredient.name));
      nextIds.add(ingredientId);

      const existingIngredient = currentById.get(ingredientId);

      if(!existingIngredient) {
        await attachIngredientToRecipe(recipe.id, {
          ingredientId,
          quantity: ingredient.quantity,
        });
        continue;
      }

      if (existingIngredient.quantity !== ingredient.quantity) {
        await updateRecipeIngredientQuantity(recipe.id, ingredientId, ingredient.quantity);
      }
    }

    for (const ingredient of recipe.ingredients) {
      if (!nextIds.has(ingredient.id)) {
        await removeIngredientFromRecipe(recipe.id, ingredient.id);
      }
    }
  }

  async function handleEditRecipe(values: RecipeFormValues) {
    if (!editingRecipe) return;

    try {
      setFormSaving(true);
      setError("");

      const recipeResponse = await updateRecipe(editingRecipe.id, {
        name: values.name,
        description: values.description,
        mealTypes: values.mealTypes,
        instructions: values.instructions,
      });

      await syncRecipeIngredients(editingRecipe, values.ingredients);
      const updatedRecipe = recipeResponse.data;

      setEditingRecipe(null);
      await loadRecipes();

      if (selectedRecipe?.id === updatedRecipe.id) {
        setSelectedRecipe(null);
      }
    } catch (err) {
      console.error(err);
      throw new Error("Failed to update recipe.");
    } finally {
      setFormSaving(false);
    }
  }

  async function handleDeleteRecipe(recipe: Recipe) {
    const confirmed = window.confirm(`Delete "${recipe.name}"?`);
    if (!confirmed) return;

    try {
      setDeleteLoadingId(recipe.id);
      setError("");

      await deleteRecipe(recipe.id)

      if (selectedRecipe?.id === recipe.id) {
        setSelectedRecipe(null);
      }

      if (editingRecipe?.id === recipe.id) {
        setEditingRecipe(null);
      }
    
      await loadRecipes();
    } catch (err) {
      console.error(err);
      setError("Failed to delete recipe.");
    } finally {
      setDeleteLoadingId(null);
    }
  }

  async function handleToggleFavorite(recipeId: string, isFavorite: boolean) {
    if (!isAuthenticated) return;

    try {
      setFavoriteLoading(true);

      if (isFavorite) {
        await removeFavorite(recipeId);
        setFavoriteIds((prev) => prev.filter((id) => id !== recipeId));
      } else {
        await addFavorite(recipeId);
        setFavoriteIds((prev) => [...prev, recipeId]);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update favorite.");
    } finally {
      setFavoriteLoading(false);
    }
  }

  return (
    <section className="recipes-page">
      <div className="recipes-hero">
        <div>
          <span className="recipes-eyebrow">Recipe Library</span>
          <h2 className="recipes-title">Browse and search your recipes</h2>
          <p className="recipes-subtitle">
            Search by recipe name or ingredient, then open any recipe to view full ingredients and instructions.
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
          <button
            type="button"
            className="primary-button"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add Recipe
          </button>
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
              <article 
                key={recipe.id} 
                className="recipe-card clickable"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <div className="recipe-card-header">
                  <h3>{recipe.name}</h3>
                  <div className="recipe-card-header-right">
                    {favoriteIds.includes(recipe.id) && (
                      <span className="favorite-badge">★ Favorite</span>
                    )}
                  </div>
                </div>

                {recipe.description && (
                  <p className="recipe-description">{recipe.description}</p>
                )}
                
                <div className="recipe-card-action recipe-card-actions-row">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedRecipe(recipe);
                    }}
                  >
                    View Recipe
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditingRecipe(recipe);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="danger-button"
                    disabled={deleteLoadingId === recipe.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleDeleteRecipe(recipe);
                    }}
                  >
                    {deleteLoadingId === recipe.id ? "Deleting..." : "Delete"}
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

      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={!!selectedRecipe}
        isFavorite={
          selectedRecipe ? favoriteIds.includes(selectedRecipe.id) : false
        }
        favoriteLoading={favoriteLoading}
        isAuthenticated={isAuthenticated}
        onClose={() => setSelectedRecipe(null)}
        onToggleFavorite={handleToggleFavorite}
        onEdit={(recipe) => {
          setSelectedRecipe(null);
          setEditingRecipe(recipe);
        }}
        onDelete={(recipe) => {
          void handleDeleteRecipe(recipe);
        }}
        deleteLoading={deleteLoadingId === selectedRecipe?.id}
      />

      <RecipeFormModal
        isOpen={isCreateModalOpen}
        mode="create"
        saving={formSaving}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRecipe}
      />

      <RecipeFormModal
        isOpen={!!editingRecipe}
        mode="edit"
        recipe={editingRecipe}
        saving={formSaving}
        onClose={() => setEditingRecipe(null)}
        onSubmit={handleEditRecipe}
      />
    </section>
  );
}