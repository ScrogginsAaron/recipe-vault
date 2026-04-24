import { useEffect, useState } from "react";
import type { Recipe } from "../api/recipes";

type RecipeFormIngredient = {
  id?: string;
  name: string;
  quantity: string;
};

export type RecipeFormValues = {
  name: string;
  description: string;
  mealTypes: string[];
  instructions: string[];
  ingredients: RecipeFormIngredient[];
};

type Props = {
  isOpen: boolean;
  mode: "create" | "edit";
  recipe?: Recipe | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: RecipeFormValues) => Promise<void> | void;
};

const MEAL_TYPE_OPTIONS = [
  "breakfast",
  "lunch",
  "dinner",
  "dessert",
] as const;

function getInitialValues(recipe?: Recipe | null): RecipeFormValues {
  if (!recipe) {
    return {
      name: "",
      description: "",
      mealTypes: [],
      instructions: [""],
      ingredients: [{ name: "", quantity: "" }],
    };
  }

  return {
    name: recipe.name ?? "",
    description: recipe.description ?? "",
    mealTypes: recipe.mealTypes ?? [],
    instructions:
      recipe.instructions && recipe.instructions.length > 0
        ? recipe.instructions
        : [""],
    ingredients:
      recipe.ingredients && recipe.ingredients.length > 0
        ? recipe.ingredients.map((ingredient) => ({
          id: ingredient.id,
          name: ingredient.name ?? "",
          quantity: ingredient.quantity ?? "",
        }))
      : [{ name: "", quantity: "" }],
  };
}

export default function RecipeFormModal({
  isOpen,
  mode,
  recipe,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<RecipeFormValues>(getInitialValues(recipe));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setForm(getInitialValues(recipe));
    setError("");
  }, [isOpen, recipe]);

  function updateField<K extends keyof RecipeFormValues>(
    field: K,
    value: RecipeFormValues[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function toggleMealType(mealType: string) {
    setForm((prev) => {
      const exists = prev.mealTypes.includes(mealType);

      return {
        ...prev,
        mealTypes: exists
          ? prev.mealTypes.filter((item) => item !== mealType)
          : [...prev.mealTypes, mealType],
      };
    });
  }

  function updateIngredient(
    index: number,
    field: keyof RecipeFormIngredient,
    value: string
  ) {
    setForm((prev) => {
      const nextIngredients = [...prev.ingredients];
      nextIngredients[index] = {
        ...nextIngredients[index],
        [field]: value,
      };

      return {
        ...prev,
        ingredients: nextIngredients,
      };
    });
  }

  function addIngredientRow() {
    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: "", quantity: "" }],
    }));
  }

  function removeIngredientRow(index: number) {
    setForm((prev) => {
      const nextIngredients = prev.ingredients.filter((_, i) => i !== index);

      return {
        ...prev,
        ingredients:
          nextIngredients.length > 0
            ? nextIngredients
            : [{ name: "", quantity: "" }],
      };
    });
  }

  function updateInstruction(index: number, value: string) {
    setForm((prev) => {
      const nextInstructions = [...prev.instructions];
      nextInstructions[index] = value;

      return {
        ...prev,
        instructions: nextInstructions,
      };
    });
  }

  function addInstructionRow() {
    setForm((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  }

  function removeInstructionRow(index: number) {
    setForm((prev) => {
      const nextInstructions = prev.instructions.filter((_, i) => i !== index);
 
      return {
        ...prev,
        instructions: nextInstructions.length > 0 ? nextInstructions : [""],
      };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedName = form.name.trim();
    const normalizedDescription = form.description.trim();

    const normalizedInstructions = form.instructions
      .map((instruction) => instruction.trim())
      .filter(Boolean);

    const normalizedIngredients = form.ingredients
      .map((ingredient) => ({
        ...ingredient,
        name: ingredient.name.trim().toLowerCase(),
        quantity: ingredient.quantity.trim().toLowerCase(),
      }))
      .filter((ingredient) => ingredient.name || ingredient.quantity);

    if (!normalizedName) {
      setError("Recipe name is required.");
      return;
    }

    const hasIncompleteIngredient = normalizedIngredients.some(
      (ingredient) => !ingredient.name || !ingredient.quantity
    );

    if (hasIncompleteIngredient) {
      setError("Each ingredient needs both a name and a quantity.");
      return;
    }

    if (normalizedInstructions.length === 0) {
      setError("Add at least one instruction.");
      return;
    }

    try {
      await onSubmit({
        name: normalizedName,
        description: normalizedDescription,
        mealTypes: form.mealTypes,
        instructions: normalizedInstructions,
        ingredients: normalizedIngredients,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save recipe."
      );
    }
  }

  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="recipe-modal recipe-form-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="recipe-modal-header">
          <div>
            <p className="recipes-eyebrow">
              {mode === "create" ? "New Recipe" : "Edit Recipe"}
            </p>
            <h2>{mode === "create" ? "Add Recipe" : "Edit Recipe"}</h2>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close recipe form"
          >
            X
          </button>
        </div>

        <form className="recipe-form" onSubmit={handleSubmit}>
          <div className="recipe-form-section">
            <label className="field-label" htmlFor="recipe-name">
              Recipe Name
            </label>
            <input
              id="recipe-name"
              type="text"
              className="text-input"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Ex: Chicken Alfredo"
              disabled={saving}
            />
          </div>

          <div className="recipe-form-section">
            <label className="field-label" htmlFor="recipe-description">
              Description
            </label>
            <textarea
              id="recipe-description"
              className="text-area"
              rows={3}
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Short description of the recipe"
              disabled={saving}
            />
          </div>

          <div className="recipe-form-section">
            <span className="field-label">Meal Types</span>
            <div className="chip-row">
               {MEAL_TYPE_OPTIONS.map((mealType) => {
                 const selected = form.mealTypes.includes(mealType);

                 return (
                   <button
                     key={mealType}
                     type="button"
                     className={`chip-button ${selected ? "selected" : ""}`}
                     onClick={() => toggleMealType(mealType)}
                     disabled={saving}
                   >
                     {mealType}
                   </button>
                 );
               })}
             </div>
           </div>

           <div className="recipe-form-section">
             <div className="section-heading-row">
               <span className="field-label">Ingredients</span>
               <button
                 type="button"
                 className="secondary-button"
                 onClick={addIngredientRow}
                 disabled={saving}
               >
                 Add Ingredient
               </button>
             </div>

             <div className="stack-md">
               {form.ingredients.map((ingredient, index) => (
                 <div key={`${ingredient.id ?? "new"}-${index}`} className="inline-form-grid">
                   <input
                     type="text"
                     className="text-input"
                     value={ingredient.name}
                     onChange={(event) =>
                       updateIngredient(index, "name", event.target.value)
                     }
                     placeholder="Ingredient name"
                     disabled={saving}
                   />

                   <input
                     type="text"
                     className="text-input"
                     value={ingredient.quantity}
                     onChange={(event) =>
                       updateIngredient(index, "quantity", event.target.value)
                     }
                     placeholder="Quantity"
                     disabled={saving}
                   />
      
                   <button
                     type="button"
                     className="danger-button"
                     onClick={() => removeIngredientRow(index)}
                     disabled={saving}
                   >
                     Remove
                   </button>
                 </div>
               ))}
             </div>
           </div>

           <div className="recipe-form-section">
             <div className="section-heading-row">
               <span className="field-label">Instructions</span>
               <button
                 type="button"
                 className="secondary-button"
                 onClick={addInstructionRow}
                 disabled={saving}
               >
                 Add Step
              </button>
            </div>

            <div className="stack-md">
              {form.instructions.map((instruction, index) => (
                <div key={index} className="instruction-row">
                  <div className="instruction-number">Step {index + 1}</div>
                  <textarea
                    className="text-area"
                    rows={3}
                    value={instruction}
                    onChange={(event) =>
                      updateInstruction(index, event.target.value)
                    }
                    placeholder={`Describe step ${index + 1}`}
                    disabled={saving}
                  />

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => removeInstructionRow(index)}
                    disabled={saving}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="recipe-modal-actions recipe-modal-actions-wrap">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
 
            <button 
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                  ? "Create Recipe"
                  : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
  