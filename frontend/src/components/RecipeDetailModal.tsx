import type { Recipe } from "../api/recipes";

type Props = {
  recipe: Recipe | null;
  isOpen: boolean;
  isFavorite: boolean;
  favoriteLoading: boolean;
  isAuthenticated: boolean;
  deleteLoading?: boolean;
  onClose: () => void;
  onToggleFavorite: (recipeId: string, isFavorite: boolean) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
};

export default function RecipeDetailModal({
  recipe,
  isOpen,
  isFavorite,
  favoriteLoading,
  isAuthenticated,
  deleteLoading,
  onClose,
  onToggleFavorite,
  onEdit,
  onDelete,
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

        <div className="recipe-modal-actions recipe-modal-actions-wrap">
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

          <button
            type="button"
            className="secondary-button"
            onClick={() => onEdit(recipe)}
          >
            Edit Recipe
          </button>

          <button
            type="button"
            className="danger-button"
            disabled={deleteLoading}
            onClick={() => onDelete(recipe)}
          >
            {deleteLoading ? "Deleting..." : "Delete Recipe"}
          </button>
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