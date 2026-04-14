import prisma from "../config/prisma";
import { Request, Response, NextFunction } from "express";

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

function normalizeIngredientName(name: string): string {
  return name.trim().toLowerCase();
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

function normalizeUnit(unit: string): string {
  const u = unit.trim().toLowerCase();

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

  return unitMap[u] ?? u;
}

function parseAmountToken(amountText: string): number | null {
  const text = amountText.trim();

  if (!text) return null;

  if (/^\d+\s+\d+\/\d+$/.test(text)) {
    const [whole, fraction] = text.split(/\s+/);
    const [num, den] = fraction.split("/");
    return Number(whole) + Number(num) / Number(den);
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

  if (!unit) return `${rounded}`;
  return `${rounded} ${unit}`;
}

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
      parseable: false,
    };
  }

  const normalized = raw
    .replace(/-/g, "-")
    .replace(/-/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  if (/^(to taste|as needed|for garnish|optional)$/i.test(normalized)) {
    return {
      raw: quantity,
      amount: null,
      unit: "",
      qualifier: normalized.toLowerCase(),
      sizeText: "",
      displayUnit: "",
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
      parseable: false,
    };
  }

  const startAmount = parseAmountToken(amountMatch[1]);
  const endAmount = amountMatch[2] ? parseAmountToken(amountMatch[2]) : null;
  const remainder = (amountMatch[3] ?? "").trim();

  if (startAmount === null) {
    return {
      raw: quantity,
      amount: null,
      unit: "",
      qualifier: "",
      sizeText: "",
      displayUnit: "",
      parseable: false,
    };
  }

  const amount =
    endAmount !== null ? endAmount : startAmount;

  let rest = remainder;
  let sizeText = "";
  let qualifier = "";
  
  const parenMatches = [...rest.matchAll(/\(([^)]+)\)/g)];
  if (parenMatches.length > 0) {
    sizeText = parenMatches.map((m) => m[1].trim()).join(", ");
    rest = rest.replace(/\(([^)]+)\)/g, "").replace(/\s+/g, " ").trim();
  }

  const tokens = rest.split(/\s+/).filter(Boolean);

  const candidateUnitLengths = [2, 1];
  let detectedUnit = "";
  let consumedTokenCount = 0;

  for (const len of candidateUnitLengths) {
    const phrase = tokens.slice(0, len).join(" ").toLowerCase();
    const normalizedPhrase = normalizeUnit(phrase);

    if (phrase && normalizedPhrase !== phrase) {
      detectedUnit = normalizedPhrase;
      consumedTokenCount = len;
      break;
    }

    const knownSingleOrPhraseUnits = new Set([
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

    if (knownSingleOrPhraseUnits.has(normalizedPhrase)) {
      detectedUnit = normalizedPhrase;
      consumedTokenCount = len;
      break;
    }
  }

  if (!detectedUnit && tokens.length > 0) {
    const first = tokens[0].toLowerCase();
    const descriptorWords = new Set([
      "small",
      "medium",
      "large",
      "extra-large",
      "extra",
    ]);

    if (descriptorWords.has(first) && tokens.length > 1) {
      const next = normalizeUnit(tokens[1].toLowerCase());
      if (
        [
          "egg",
          "clove",
          "slice",
          "can",
          "package",
          "bag",
          "bunch",
          "leaf",
          "stick",
          "piece",
          "filet",
          "fillet",
          "jar",
          "bottle",
        ].includes(next)
      ) {
        qualifier = first;
        detectedUnit = next;
        consumedTokenCount = 2;
      }
    }
  }
        
  const leftover = tokens.slice(consumedTokenCount).join(" ").trim();
  const displayUnit = detectedUnit || "";

  return {
    raw: quantity,
    amount,
    unit: detectedUnit,
    qualifier,
    sizeText,
    displayUnit,
    remainder: leftover,
    parseable: true,
  };
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const parsed = new Date(year, month - 1, day);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function buildIngredientSummary(menu: any[]) {
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
    for (const mealKey of ["breakfast", "lunch", "dinner"] as const) {
      const recipe = day.meals[mealKey];
    
      if (!recipe) continue;

      for (const ingredient of recipe.ingredients) {
        const originalName = ingredient.name?.trim() || "Unknown ingredient";
        const normalizedName = normalizeIngredientName(originalName);
        const quantity = ingredient.quantity?.trim();

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

        if (!quantity) continue;
 
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
          entry.notes.push(parsed.qualifier);
        }
 
        if (parsed.sizeText) {
          entry.notes.push(parsed.sizeText);
        }
  
        if (parsed.remainder) {
          entry.notes.push(parsed.remainder);
        }
      }
    }
  }

  return Array.from(ingredientMap.values()).map((item) => {
    const combinedTotals = Array.from(item.totalsByUnit.entries()).map(
      ([unit, amount]) => formatTotalQuantity(amount, unit)
    );

    const uniqueNotes = [...new Set(item.notes)];

    return {
      name: item.name,
      quantities: item.quantities,
      totalQuantity: combinedTotals.length > 0 ? combinedTotals.join(" + ") : null,
      unparsedQuantities: item.unparsedQuantities,
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
    const { source, days = 7, startDate } = req.body;
    const userId = req.user!.id;

    const parsedStartDate = startDate
      ? parseLocalDate(startDate) 
      : new Date();
   
    if (!parsedStartDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate. Use YYYY-MM-DD format.",
      });
    }

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

      const currentDate = new Date(parsedStartDate);
      currentDate.setDate(parsedStartDate.getDate() + i);

      menu.push({
        day: dayNames[currentDate.getDay()],
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

    const userId = req.user!.id;

    if (dayIndex < 0 || dayIndex >= currentMenu.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid dayIndex.",
      });
    }

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

    const excludedIds = new Set(
      [excludeRecipeId, ...usedRecipeIds].filter(Boolean)
    );

    let candidates = recipes.filter(
      (recipe) =>
        recipe.mealTypes.includes(mealType) && !excludedIds.has(recipe.id)
    );

    if (candidates.length === 0) {
      candidates = recipes.filter(
        (recipe) =>
          recipe.mealTypes.includes(mealType) && recipe.id !== excludeRecipeId
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

    const updatedMenu = currentMenu.map((day: any, index: number) => {
      if (index !== dayIndex) return day;

      return {
        ...day,
        meals: {
          ...day.meals,
          [mealType]: formattedRecipe,
        },
      };
    });

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
