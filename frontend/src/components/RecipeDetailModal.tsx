type Ingredient = {
  id: string;
  name: string;
  quantity: string;
};

type Recipe = {
  id: string;
  name: string;
  description?: string;
  instructions?: string[];
  mealTypes?: string[];
  createdAt: string;
  ingredients: Ingredient[];
}

type Props = {
  recipe: Recipe | null;
  isOpen: boolean;
  isFavorite: boolean;
  favoriteLoading: boolean;
  isAuthenticated: boolean;
  onClose: () => void;
  onToggleFavorite: (recipeId: string, isFavorite: boolean) => void;
};

export default function RecipeDetailModal({
  recipe,
  isOpen,
  isFavorite,
  favoriteLoading,
  isAuthenticated,
  onClose,
  onToggleFavorite
}: Props) {
  if (!isOpen || !recipe) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="recipe-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-modal-title"
      >
        <div className="recipe-modal-header">
          <div>
            <h2 id="recipe-modal-title">{recipe.name}</h2>
            {recipe.description && (
              <p className="recipe-modal-description">{recipe.description}</p>
            )}
          </div>

          <button type="button" className="modal-close-button" onClick={onClose}>
            X
          </button>
        </div>

        <div className="recipe-modal-actions">
          {isAuthenticated && (
            <button
              type="button"
              className="favorite-button"
              disabled={favoriteLoading}
              onClick={() => onToggleFavorite(recipe.id, isFavorite)}
            >
              {favoriteLoading
                ? "Saving..."
                : isFavorite
                ? "Remove Favorite"
                : "Add to Favorites"}
            </button>
          )}
        </div>

        <div className="recipe-modal-section">
          <h3>Ingredients</h3>
          {recipe.ingredients.length === 0 ? (
            <p className="muted-text">No ingredients listed.</p>
          ) : (
            <ul className="recipe-modal-list">
              {recipe.ingredients.map((ingredient) => (
                <li key={`${recipe.id}-${ingredient.id}`}>
                  {ingredient.quantity} {ingredient.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="recipe-modal-section">
          <h3>Instructions</h3>
          {!recipe.instructions || recipe.instructions.length === 0 ? (
            <p className="muted-text">No instructions provided.</p>
          ) : (
            <ol className="recipe-modal-list numbered">
              {recipe.instructions.map((step, index) => (
                <li key={`${recipe.id}-step-${index}`}>{step}</li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}