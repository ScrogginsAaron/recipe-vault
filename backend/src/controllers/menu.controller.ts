import prisma from "../config/prisma";
import type { NextFunction, Request, Response } from "express";

const recipeInclude = {
  ingredients: {
    include: {
      ingredient: true,
    },
  },
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const VALID_MEAL_TYPES = [
  "breakfast",
  "lunch",
  "dinner",
] as const;

// Allows normalized units to be correctly detected during parsing.
const KNOWN_UNITS = new Set([
  "cup",
  "tablespoon",
  "teaspoon",
  "ounce",
  "fluid ounce",
  "pound",
  "gram",
  "kilogram",
  "milliliter",
  "leaf",
  "liter",
  "clove",
  "slice",
  "can",
  "package",
  "bag",
  "bunch",
  "stick",
  "piece",
  "egg",
  "filet",
  "fillet",
  "jar",
  "bottle",
  "pinch",
  "dash",
]);

const DESCRIPTOR_WORDS = new Set([
  "small",
  "medium",
  "large",
  "extra-large",
  "extra",
]);

type RecipeWithIngredients = {
  id: string;
  name: string;
  description: string | null;
  instructions: string[];
  mealTypes: string[];
  createdAt: Date;

  ingredients: Array<{
    quantity: string | null;

    ingredient: {
      id: string;
      name: string;
    };
  }>;
};

type FormattedRecipe = ReturnType<typeof formatRecipe>;

type WeeklyMenuDay = {
  day: string;
  date: string;

  meals: {
    breakfast: FormattedRecipe;
    lunch: FormattedRecipe;
    dinner: FormattedRecipe;
  };
};

// Shuffles arrays so they don't feel as repetitive.
function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];

  for (let i = copy.length -1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

// Normalizes ingredient names for consistent grouping.
function normalizeIngredientName(name: string): string {
  return name.trim().toLowerCase();
}

// Transforms the recipe data into the form used by the front end.
function formatRecipe(recipe: RecipeWithIngredients) {
  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    instructions: recipe.instructions,
    mealTypes: recipe.mealTypes,
    createdAt: recipe.createdAt,

    ingredients: recipe.ingredients.map((recipeIngredient) => ({
      id: recipeIngredient.ingredient.id,
      name: recipeIngredient.ingredient.name,
      quantity: recipeIngredient.quantity,
    })),
  };
}

// Retrieves recipes from either all or favorited recipes.
async function getRecipePool(
  source: string,
  userId: string
): Promise<RecipeWithIngredients[]> {
  if (source === "favorites") {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      
      include: {
        recipe: {
          include: recipeInclude,
        },
      },
    });
  
    return favorites.map(
      (favorite) => favorite.recipe
    ) as RecipeWithIngredients[];
  }

  return prisma.recipe.findMany({
    include: recipeInclude,
  }) as Promise<RecipeWithIngredients[]>;
}

/**
 * Normalize measurement units so quantities can be combined.
 * Example:
 * - cups -> cup
 * - tbsp -> tablespoon
 */
function normalizeUnit(unit: string): string {
  const normalizedUnit = unit.trim().toLowerCase();

  const unitMap: Record<string, string> = {
    cup: "cup",
    cups: "cup",

    tbsp: "tablespoon",
    tablespoon: "tablespoon",
    tablespoons: "tablespoon",

    tsp: "teaspoon",
    teaspoon: "teaspoon",
    teaspoons: "teaspoon",

    oz: "ounce",
    ounce: "ounce",
    ounces: "ounce",

    fl: "fluid ounce",
    "fl oz": "fluid ounce",
    "fluid ounce": "fluid ounce",
    "fluid ounces": "fluid ounce",

    lb: "pound",
    lbs: "pound",
    pound: "pound",
    pounds: "pound",

    g: "gram",
    gram: "gram",
    grams: "gram",

    kg: "kilogram",
    kilogram: "kilogram",
    kilograms: "kilogram",

    ml: "milliliter",
    milliliter: "milliliter",
    milliliters: "milliliter",

    leaf: "leaf",
    leaves: "leaf",

    l: "liter",
    liter: "liter",
    liters: "liter",

    clove: "clove",
    cloves: "clove",

    slice: "slice",
    slices: "slice",

    can: "can",
    cans: "can",

    package: "package",
    packages: "package",
    pkg: "package",

    bag: "bag",
    bags: "bag",

    bunch: "bunch",
    bunches: "bunch",

    stick: "stick",
    sticks: "stick",

    piece: "piece",
    pieces: "piece",

    egg: "egg",
    eggs: "egg",

    filet: "filet",
    filets: "filet",

    fillet: "fillet",
    fillets: "fillet",

    jar: "jar",
    jars: "jar",

    bottle: "bottle",
    bottles: "bottle",

    pinch: "pinch",
    pinches: "pinch",

    dash: "dash",
    dashes: "dash",
  };

  return unitMap[normalizedUnit] ?? normalizedUnit;
}

/**
 * Converts quantity text into a numeric value.
 * Supports:
 * - 1
 * - 1.5
 * - 1/2
 * - 1 1/2
 */
function parseAmountToken(amountText: string): number | null {
  const text = amountText.trim();

  if (!text) {
    return null;
  }

  if (/^\d+\s+\d+\/\d+$/.test(text)) {
    const [whole, fraction] = text.split(/\s+/);
    const [num, den] = fraction.split("/");
    return (
      Number(whole) + 
      Number(num) / Number(den)
    );
  }

  if (/^\d+\/\d+$/.test(text)) {
    const [num, den] = text.split("/");
    const denominator = Number(den);
    if (!denominator) return null;
    return Number(num) / denominator;
  }

  if (/^\d+(?:\.\d+)?$/.test(text)) {
    return Number(text);
  }

  return null;
}

function formatTotalQuantity(amount: number, unit: string) {
  const rounded = Number(amount.toFixed(2));

  if (!unit) {
    return `${rounded}`;
  }
  return `${rounded} ${unit}`;
}

/**
 * Parse ingredient quantities into a structured data
 * so quantities can be combined into shopping totals.
 */
function parseQuantity(quantity: string) {
  const raw = quantity.trim();

  if (!raw) {
    return {
      raw: quantity,
      amount: null as number | null,
      unit: "",
      qualifier: "",
      sizeText: "",
      displayUnit: "",
      remainder: "",
      parseable: false,
    };
  }

  const normalized = raw
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  // Handle non-measurable quantities.
  if (
    /^(to taste|as needed|for garnish|optional)$/i.test(
      normalized
    )
  ) {
    return {
      raw: quantity,
      amount: null,
      unit: "",
      qualifier: normalized.toLowerCase(),
      sizeText: "",
      displayUnit: "",
      remainder: "",
      parseable: false,
    };
  }

  const amountMatch = normalized.match(
    /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)(?:\s*-\s*(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?))?\s*(.*)$/i
  );

  if (!amountMatch) {
    return {
      raw: quantity,
      amount: null,
      unit: "",
      qualifier: "",
      sizeText: "",
      displayUnit: "",
      remainder: "",
      parseable: false,
    };
  }

  const startAmount = parseAmountToken(amountMatch[1]);
  const endAmount = amountMatch[2] ? parseAmountToken(amountMatch[2]) : null;
  const remainderText = (amountMatch[3] ?? "").trim();

  if (startAmount === null) {
    return {
      raw: quantity,
      amount: null,
      unit: "",
      qualifier: "",
      sizeText: "",
      displayUnit: "",
      remainder: "",
      parseable: false,
    };
  }

  /**
   * Use the upper range when parsing ranges.
   * Example:
   * 1-2 cups -> 2 cups
   */
  const amount =
    endAmount !== null ? endAmount : startAmount;

  let remainingText = remainderText;

  let sizeText = "";
  let qualifier = "";

  /**
   * Extract parenthetical size details.
   * Example:
   * 2 cans (14 oz each)
   */
  const parentheticalMatches = [
    ...remainingText.matchAll(
      /\(([^)]+)\)/g
    ),
  ];

  if (parentheticalMatches.length > 0) {
    sizeText = parentheticalMatches
      .map((match) => match[1].trim())
      .join(", ");
 
    remainingText = remainingText
      .replace(/\(([^)]+)\)/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  const tokens = remainingText
    .split(/\s+/)
    .filter(Boolean);

  let detectedUnit = "";
  let consumedTokenCount = 0;


  /**
   * Attempt to detect multi-word units first.
   * Example:
   * "fluid ounce"
   */
  for (const len of [2, 1]) {
    const phrase = tokens
      .slice(0, len)
      .join(" ")
      .toLowerCase();

    const normalizedPhrase = normalizeUnit(phrase);

    if (
      phrase && 
      KNOWN_UNITS.has(normalizedPhrase)
    ) {
      detectedUnit = normalizedPhrase;
      consumedTokenCount = len;

      break;
    }
  }

  /**
  * Handle descriptor-based quantities.
  * Example:
  * "2 large eggs"
  */
  if (
    !detectedUnit &&
    tokens.length > 1
  ) {
    const firstToken = tokens[0].toLowerCase();

    if (
      DESCRIPTOR_WORDS.has(firstToken)
    ) {
      const nextToken = 
        normalizeUnit(
          tokens[1].toLowerCase()
        );

      if (
        KNOWN_UNITS.has(nextToken)
      ) {
        qualifier = firstToken;
        detectedUnit = nextToken;
        consumedTokenCount = 2;
      }
    }
  }
        
  const remainder = tokens
    .slice(consumedTokenCount)
    .join(" ")
    .trim();

  return {
    raw: quantity,
    amount,
    unit: detectedUnit,
    qualifier,
    sizeText,
    displayUnit: detectedUnit,
    remainder,
    parseable: true,
  };
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
    ).padStart(2, "0");

  const day = String(
    date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString: string) {
  const [year, month, day] = 
    dateString.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const parsedDate = new Date(
    year,
    month - 1, 
    day
  );

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

/**
 * Combine ingredients across all meals
 * into a grocery-style shopping summary.
 */
function buildIngredientSummary(menu: WeeklyMenuDay[]) {
  const ingredientMap = new Map<
    string,
    { 
      name: string; 
      quantities: string[];
      totalsByUnit: Map<string, number>;
      unparsedQuantities: string[];
      notes: string[];
    }
  >();
  
  for (const day of menu) {
    for (const mealType of VALID_MEAL_TYPES) {
      const recipe = day.meals[mealType];

      for (const ingredient of recipe.ingredients) {
        const originalName = 
          ingredient.name?.trim() ||
          "Unknown ingredient";

        const normalizedName = normalizeIngredientName(originalName);

        let entry = ingredientMap.get(normalizedName);

        if (!entry) {
          entry = {
            name: originalName,
            quantities: [],
            totalsByUnit: new Map<string, number>(),
            unparsedQuantities: [],
            notes: [],
          };

          ingredientMap.set(normalizedName, entry);
        }

        const quantity = ingredient.quantity?.trim();

        if (!quantity){
          continue;
        }

        entry.quantities.push(quantity);
 
        const parsed = parseQuantity(quantity);

        if (!parsed.parseable || parsed.amount === null) {
          entry.unparsedQuantities.push(quantity);

          continue;
        }

        const unitKey = parsed.unit || "";
 
        entry.totalsByUnit.set(
          unitKey,
          (entry.totalsByUnit.get(unitKey) ?? 0) + parsed.amount
        );

        if (parsed.qualifier) {
          entry
          .notes
          .push(parsed.qualifier);
        }
 
        if (parsed.sizeText) {
          entry
          .notes
          .push(parsed.sizeText);
        }
  
        if (parsed.remainder) {
          entry
          .notes
          .push(parsed.remainder);
        }
      }
    }
  }

  return Array.from(
    ingredientMap.values()
  ).map((ingredient) => {
    const combinedTotals = Array.from(
      ingredient
      .totalsByUnit
      .entries()
    ).map(([unit, amount]) =>
      formatTotalQuantity(amount, unit)
    );

    const uniqueNotes = [...new Set(ingredient.notes)];

    return {
      name: ingredient.name,
      quantities: ingredient.quantities,
      totalQuantity: 
        combinedTotals.length > 0 ? combinedTotals.join(" + ") 
        : null,
      unparsedQuantities: ingredient.unparsedQuantities,
      notes: uniqueNotes,
    };
  });
}

export const generateWeeklyMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      source,
      days = 7,
      startDate
    } = req.body;


    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id;

    const parsedStartDate = startDate
      ? parseLocalDate(startDate) 
      : new Date();
   
    if (!parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate. Use YYYY-MM-DD format.",
      });
    }

    const recipes = await getRecipePool(source, userId);

    const breakfastRecipes = recipes.filter((recipe) =>
      recipe
      .mealTypes
      .includes(
        "breakfast"
      )
    );

    const lunchRecipes = recipes.filter((recipe) =>
      recipe
      .mealTypes
      .includes(
        "lunch"
      )
    );

    const dinnerRecipes = recipes.filter((recipe) =>
      recipe
      .mealTypes
      .includes(
        "dinner"
      )
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

    // Shuffle recipes first to reduce repetition.
    const shuffledBreakfast = shuffleArray(breakfastRecipes);
    const shuffledLunch = shuffleArray(lunchRecipes);
    const shuffledDinner = shuffleArray(dinnerRecipes);

    const menu: WeeklyMenuDay[] = [];

    for (let i = 0; i < days; i++) {
      /**
       * Reuse recipes cyclically if there
       * are fewer recipes than requested days.
       */
      const breakfast = shuffledBreakfast[i % shuffledBreakfast.length];
      const lunch = shuffledLunch[i % shuffledLunch.length];
      const dinner = shuffledDinner[i % shuffledDinner.length];

      const currentDate = new Date(parsedStartDate);
      currentDate.setDate(parsedStartDate.getDate() + i);

      menu.push({
        day: DAY_NAMES[currentDate.getDay()],
        date: formatLocalDate(currentDate),
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

export const rerollMenuRecipe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      source,
      dayIndex,
      mealType,
      excludeRecipeId,
      usedRecipeIds = [],
      currentMenu,
    } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!VALID_MEAL_TYPES.includes(mealType)){
      return res.status(400).json({
        success: false,
        message: "Invalid meal type.",
      });
    }

    const userId = req.user.id;

    if (
      dayIndex < 0 ||
      dayIndex >= currentMenu.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid dayIndex.",
      });
    }

    const recipes = await getRecipePool(source, userId);

    const excludedIds = new Set(
      [excludeRecipeId, ...usedRecipeIds].filter(Boolean)
    );

    let candidates = 
      recipes.filter(
        (recipe) =>
          recipe
          .mealTypes
          .includes(
            mealType
          ) && 
          !excludedIds.has(
            recipe.id
          )
    );

    /**
     * If all recipes were excluded,
     * allows reuse of all but the current recipe.
    */
    if (candidates.length === 0) {
      candidates = recipes.filter(
        (recipe) =>
          recipe
          .mealTypes
          .includes(
            mealType
          ) &&
          recipe.id !== excludeRecipeId
      );
    }

    if (candidates.length === 0){
      return res.status(400).json({
        success: false,
        message: `No alternative ${mealType} recipes available.`,
      });
    }
  
    const [selectedRecipe] = shuffleArray(candidates);
    const formattedRecipe = formatRecipe(selectedRecipe);

    const updatedMenu = currentMenu.map(
      (
        day: WeeklyMenuDay,
        index: number
      ) => {
        if (index !== dayIndex) {
          return day;
        }

        return {
          ...day,
          meals: {
            ...day.meals,
            [mealType]: formattedRecipe,
          },
        };
      }
    );

    const ingredientsSummary = buildIngredientSummary(updatedMenu);

    return res.status(200).json({
      success: true,
      message: "Recipe rerolled successfully",

      data: {
        recipe: formattedRecipe,
        ingredientsSummary,
      },
    });
  } catch (err) {
    next(err);
  }
};
