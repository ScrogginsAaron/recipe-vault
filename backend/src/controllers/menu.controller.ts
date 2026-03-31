import prisma from "../config/prisma";

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];

  for (let i = copy.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function formatRecipe(recipe: any) {
  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    instructions: recipe.instructions,
    mealTypes: recipe.mealTypes,
    createdAt: recipe.createdAt,
    ingredients: recipe.ingredients.map((ri) => ({
      id: ri.ingredient.id,
      name: ri.ingredient.name,
      quantity: ri.quantity,
    })),
  };
}

function tryCombineQuantities(quantities: string[]) {
  const parsed = quantities.map((quantity) => {
    const match = quantity.trim().match(/^(\d+(?:\.\d+)?)\s+(.+)$/);

    if (!match) return null;

    return {
      value: Number(match[1]),
      unit: match[2].trim().toLowerCase(),
    };
  });

  if (parsed.some((item) => item === null)) {
    return null;
  }

  const firstUnit = parsed[0]!.unit;

  const sameUnit = parsed.every((item) => item!.unit === firstUnit);

  if (!sameUnit) {
    return null;
  }

  const total = parsed.reduce((sum, item) => sum + item!.value, 0);

  return `${total} ${firstUnit}`;
}

function buildIngredientSummary(menu: any[]) {
  const ingredientMap = new Map<
    string,
    { name: string; quantities: string[] }
  >();
  
  for (const day of menu) {
    for (const mealKey of ["breakfast", "lunch", "dinner"]) {
      const recipe = day.meals[mealKey];
    
      if (!recipe) continue;

      for (const ingredient of recipe.ingredients) {
        const existing = ingredientMap.get(ingredient.name);

        if (existing) {
          if (ingredient.quantity) {
            existing.quantities.push(ingredient.quantity);
          }
        } else {
          ingredientMap.set(ingredient.name, {
            name: ingredient.name,
            quantities: ingredient.quantity ? [ingredient.quantity] : [],
          });
        }
      }
    }
  }

  return Array.from(ingredientMap.values()).map((item) => ({
    name: item.name,
    quantities: item.quantities,
    totalQuantity:
      item.quantities.length > 0 ? tryCombineQuantities(item.quantities) : null,
  }));
}

export const generateWeeklyMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { source, days = 7 } = req.body;
    const userId = req.user!.id;

    let recipes;

    if (source === "favorites") {
      const favorites = await prisma.favorite.findMany({
        where: { userId },
        include: {
          recipe: {
            include: {
              ingredients: {
                include: {
                  ingredient: true,
                },
              },
            },
          },
        },
      });

      recipes = favorites.map((favorite) => favorite.recipe);
    } else {
      recipes = await prisma.recipe.findMany({
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
        },
      });
    }

    const breakfastRecipes = recipes.filter((recipe) =>
      recipe.mealTypes.includes("breakfast")
    );
    const lunchRecipes = recipes.filter((recipe) =>
      recipe.mealTypes.includes("lunch")
    );
    const dinnerRecipes = recipes.filter((recipe) =>
      recipe.mealTypes.includes("dinner")
    );

    if (
      breakfastRecipes.length === 0
    ){
      return res.status(400).json({
        success: false,
        message: "Not enough breakfast recipes to generate the desired menu."
      });
    }

    if (
      lunchRecipes.length === 0
    ){
      return res.status(400).json({
        success: false,
        message: "Not enough lunch recipes to generate the desired menu."
      });
    }

    if (
      dinnerRecipes.length === 0
    ){
      return res.status(400).json({
        success: false,
        message: "Not enough dinner recipes to generate the desired menu."
      });
    }

    const shuffledBreakfast = shuffleArray(breakfastRecipes);
    const shuffledLunch = shuffleArray(lunchRecipes);
    const shuffledDinner = shuffleArray(dinnerRecipes);

    const menu = [];

    for (let i = 0; i < days; i++) {
      const breakfast = shuffledBreakfast[i % shuffledBreakfast.length];
      const lunch = shuffledLunch[i % shuffledLunch.length];
      const dinner = shuffledDinner[i % shuffledDinner.length];

      menu.push({
        day: dayNames[i % 7],
        meals: {
          breakfast: formatRecipe(breakfast),
          lunch: formatRecipe(lunch),
          dinner: formatRecipe(dinner),
        },
      });
    }

    const ingredientsSummary = buildIngredientSummary(menu);
  
    return res.status(200).json({
      success: true,
      message: "Weekly menu generated successfully",
      data: {
        menu,
        ingredientsSummary,
      },
    });
  } catch (err) {
    next(err);
  }
};