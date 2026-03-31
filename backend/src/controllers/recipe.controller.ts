import prisma from "../config/prisma";

export const createRecipe = async (req, res, next) => {
  try{
    const { name, description, instructions, mealTypes } = req.body;

    const recipe = await prisma.recipe.create({
      data: { 
        name,
        description: description ?? "",
        instructions: instructions ?? [],
        mealTypes: mealTypes ?? [],
      },
    });

    res.status(201).json({
      success: true,
      message: "Recipe created successfully",
      data: recipe,
    });
  }  catch (err) {
    next(err);
  }
};

export const getRecipeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: {
            ingredient: true
          },
        },
      },
    });
    
    if (!recipe) {
      return res.status(404).json({ 
        success: false,
        message: "Recipe not found" 
      });
    }
    
    const formattedRecipe = {
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

    res.status(200).json({
      success: true,
      message: "Recipe retrieved successfully",
      data: formattedRecipe,
    });
  } catch (err) {
    next(err);
  }
};

export const searchRecipesByName = async (req, res, next) => {
  try {
    const { name } = req.query;

    if(!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'name' is required",
      });
    }
    
    const recipes = await prisma.recipe.findMany({
      where: {
        name: {
          contains: name,
          mode: "insensitive",
        },
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });
 
    const formatted = recipes.map((recipe) => ({
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      instructions: recipe.instructions,
      mealTypes: recipe.mealTypes,
      createdAt: recipe.createdAt,
      ingredients: recipe.ingredients.map((ri) => ({
        name: ri.ingredient.name,
        quantity: ri.quantity,
      })),
    }));

    res.status(200).json({
      success: true,
      message: "Recipe(s) retrieved successfully.",
      data: formattedRecipes,
    });
  } catch (err) {
    next(err);
  }
};

export const searchRecipesByIngredient = async (req, res, next) => {
  try {
    const { name } = req.query;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        success: false,
        message: "Query parameter 'name' is required",
      });
    }
  
    const recipes = await prisma.recipe.findMany({
      where: {
        ingredients: {
          some: {
            ingredient: {
              name: {
                contains: name.trim(),
                mode: "insensitive",
              },
            },
          },
        },
      },
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
 
    const formattedRecipes = recipes.map((recipe) => ({
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
    }));
  
    return res.status(200).json({
      success: true,
      message: "Recipe(s) retrieved successfully.",
      data: formattedRecipes,
    });
  } catch (err) {
    next(err);
  }
};

export const getRandomRecipe = async (req, res, next) => {
  try {
    const count = await prisma.recipe.count();
    
    if (count === 0) {
      return res.status(404).json({
        success: false,
        message: "No recipes found",
      });
    }

    const randomIndex = Math.floor(Math.random() * count);
  
    const recipes = await prisma.recipe.findMany({
      skip: randomIndex,
      take: 1,
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    const recipe = recipes[0];

    const formattedRecipe = {
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

    return res.status(200).json({
      success: true,
      message: "Recipe retrieved successfully.",
      data: formattedRecipe,
    });
  } catch (err) {
    next(err);
  }
};

export const getRecipes = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const skip = (Number(page) -1) * Number(limit);

    const totalRecipes = await prisma.recipe.count();

    const recipes = await prisma.recipe.findMany({
      skip,
      take: Number(limit),
      orderBy: {
        [sortBy]: order,
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    const formattedRecipes = recipes.map((recipe) => ({
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      instructions: recipe.instructions,
      createdAt: recipe.createdAt,
      mealTypes: recipe.mealTypes,
      ingredients: recipe.ingredients.map((ri) => ({
        id: ri.ingredient.id,
        name: ri.ingredient.name,
        quantity: ri.quantity,
      })),
    }));

    res.status(200).json({
      success: true,
      data: formattedRecipes,
      pagination: {
        total: totalRecipes,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalRecipes / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const attachIngredientToRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ingredientId, quantity } = req.body;

    const recipeIngredient = await prisma.recipeIngredient.create({
      data: {
        recipeId: id,
        ingredientId,
        quantity
      }
    });

    res.status(201).json({
      success: true,
      message: "Ingredient attached to recipe successfully",
      data: recipeIngredient,
    });
  } catch (err) {
    next(err);
  }
};

export const removeIngredientFromRecipe = async (req, res, next) => {
  try {
    const { id, ingredientId } = req.params;
    const existingRecipeIngredient = await prisma.recipeIngredient.findUnique({
      where: {
        recipeId_ingredientId: {
          recipeId: id,
          ingredientId,
        },
      },
    });

    if (!existingRecipeIngredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not attached to this recipe",
      });
    }
  
    await prisma.recipeIngredient.delete({
      where: {
        recipeId_ingredientId: {
          recipeId: id,
          ingredientId,
        },
      },
    });
  
    res.status(200).json({
      success: true,
      message: "Ingredient removed from recipe successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const deleteRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
   
    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if(!existingRecipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    await prisma.recipeIngredient.deleteMany({
      where: {
        recipeId: id,
      },
    });

    await prisma.recipe.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Recipe deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const updateRecipeIngredientQuantity = async (req, res, next) => {
  try {
    const { id, ingredientId } = req.params;
    const { quantity } = req.body;

    const existingRecipeIngredient = await prisma.recipeIngredient.findUnique({
      where: {
        recipeId_ingredientId: {
          recipeId: id,
          ingredientId,
        },
      },
    });
 
    if (!existingRecipeIngredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not attached to this recipe",
      });
    }

    const updatedRecipeIngredient = await prisma.recipeIngredient.update({
      where: {
        recipeId_ingredientId: {
          recipeId: id,
          ingredientId,
        },
      },
      data: {
        quantity,
      },
      include: {
        ingredient: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Ingredient quantity updated successfully",
      data: {
        recipeId: updatedRecipeIngredient.recipeId,
        ingredientId: updatedRecipeIngredient.ingredientId,
        ingredientName: updatedRecipeIngredient.ingredient.name,
        quantity: updatedRecipeIngredient.quantity,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateRecipe = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, instructions, mealTypes } = req.body;

    const existingRecipe = await prisma.recipe.findUnique({
      where: { id },
    });

    if (!existingRecipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    const updatedRecipe = await prisma.recipe.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(instructions !== undefined && { instructions }),
        ...(mealTypes !== undefined && { mealTypes }),
      },
      include: {
        ingredients: {
          include: {
            ingredient: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Recipe updated successfully",
      data: {
        id: updatedRecipe.id,
        name: updatedRecipe.name,
        description: updatedRecipe.description,
        instructions: updatedRecipe.instructions,
        mealTypes: updatedRecipe.mealTypes,
        createdAt: updatedRecipe.createdAt,
        ingredients: updatedRecipe.ingredients.map((ri) => ({
          id: ri.ingredient.id,
          name: ri.ingredient.name,
          quantity: ri.quantity,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
};
