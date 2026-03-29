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

export const generateWeeklyMenu = async (req, res, next) => {
  try {
    const { source, days = 7, mealType } = req.body;
    const userId = req.user.id;

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
        orderBy: {
          createdAt: "desc",
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
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    if (mealType) {
      recipes = recipes.filter((recipe) => recipe.mealTypes.includes(mealType));
    }

    if (recipes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No recipes available for the selected criteria",
      });
    }

    const shuffledRecipes = shuffleArray(recipes);
    const menu = [];

    for (let i = 0; i < days; i++) {
      const recipe = shuffledRecipes[i % shuffledRecipes.length];

      menu.push({
        day: dayNames[i % 7],
        mealType: mealType ?? null,
        recipe: {
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
        },
      });
    }
  
    return res.status(200).json({
      success: true,
      message: "Weekly menu generated successfully",
      data: menu,
    });
  } catch (err) {
    next(err);
  }
};