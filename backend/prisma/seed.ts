import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedRecipe = {
  name: string;
  description: string;
  instructions: string[];
  mealTypes: string[];
  ingredients: Array<{
    name: string;
    quantity: string;
  }>;
};

const recipes: SeedRecipe[] = [
  // Breakfasts
  {
    name: "Scrambled Eggs Toast",
    description: "Simple scrambled eggs with toast.",
    instructions: [
      "Whisk eggs with milk.",
      "Melt butter in a pan over medium heat.",
      "Cook eggs gently, stirring until set.",
      "Toast bread and serve on the side.",
    ],
    mealTypes: ["breakfast"],
    ingredients: [
      { name: "Eggs", quantity: "2" },
      { name: "Milk", quantity: "2 tbsp" },
      { name: "Butter", quantity: "1 tbsp" },
      { name: "Bread", quantity: "2 slices" },
      { name: "Salt", quantity: "to taste" },
    ],
  },
  {
    name: "Blueberry Oatmeal",
    description: "Warm oats with blueberries and honey.",
    instructions: [
      "Add oats and milk to a saucepan.",
      "Cook over medium heat until thickened.",
      "Stir in blueberries.",
      "Top with honey before serving.",
    ],
    mealTypes: ["breakfast"],
    ingredients: [
      { name: "Rolled Oats", quantity: "1 cup" },
      { name: "Milk", quantity: "1 1/2 cups" },
      { name: "Blueberries", quantity: "1/2 cup" },
      { name: "Honey", quantity: "1 tbsp" },
    ],
  },
  {
    name: "Greek Yogurt Parfait",
    description: "Layered yogurt, granola, and berries.",
    instructions: [
      "Spoon yogurt into a glass or bowl.",
      "Add a layer of granola.",
      "Top with strawberries and honey.",
      "Serve immediately.",
    ],
    mealTypes: ["breakfast"],
    ingredients: [
      { name: "Greek Yogurt", quantity: "1 cup" },
      { name: "Granola", quantity: "1/2 cup" },
      { name: "Strawberries", quantity: "1/2 cup" },
      { name: "Honey", quantity: "1-2 tsp" },
    ],
  },
  {
    name: "Banana Pancakes",
    description: "Fluffy banana pancakes.",
    instructions: [
      "Mix flour, baking powder, milk, and egg into a batter.",
      "Mash banana and fold it into the batter.",
      "Heat butter in a skillet.",
      "Cook pancakes until golden on both sides.",
    ],
    mealTypes: ["breakfast"],
    ingredients: [
      { name: "Flour", quantity: "1 cup" },
      { name: "Baking Powder", quantity: "1 tsp" },
      { name: "Milk", quantity: "3/4 cup" },
      { name: "Eggs", quantity: "1" },
      { name: "Banana", quantity: "1 large" },
      { name: "Butter", quantity: "1 tbsp" },
    ],
  },
  {
    name: "Avocado Toast",
    description: "Toasted bread topped with avocado.",
    instructions: [
      "Toast the bread.",
      "Mash avocado with lemon juice, salt, and pepper.",
      "Spread avocado mixture over toast.",
      "Serve immediately.",
    ],
    mealTypes: ["breakfast"],
    ingredients: [
      { name: "Bread", quantity: "2 slices" },
      { name: "Avocado", quantity: "1" },
      { name: "Lemon Juice", quantity: "1 tsp" },
      { name: "Salt", quantity: "to taste" },
      { name: "Pepper", quantity: "to taste" },
    ],
  },
  {
    name: "Veggie Omelet",
    description: "Egg omelet with peppers and onions.",
    instructions: [
      "Beat the eggs in a bowl.",
      "Cook bell pepper and onion in butter until softened.",
      "Add eggs and cook until mostly set.",
      "Add cheese, fold, and finish cooking.",
    ],
    mealTypes: ["breakfast"],
    ingredients: [
      { name: "Eggs", quantity: "3" },
      { name: "Bell Pepper", quantity: "1/2 cup" },
      { name: "Onion", quantity: "1/4 cup" },
      { name: "Cheddar Cheese", quantity: "1/4 cup" },
      { name: "Butter", quantity: "1 tbsp" },
    ],
  },
  {
    name: "Peanut Butter Banana Smoothie",
    description: "Quick breakfast smoothie.",
    instructions: [
      "Add all ingredients to a blender.",
      "Blend until smooth.",
      "Pour into a glass and serve.",
    ],
    mealTypes: ["breakfast"],
    ingredients: [
      { name: "Banana", quantity: "1" },
      { name: "Milk", quantity: "1 cup" },
      { name: "Peanut Butter", quantity: "2 tbsp" },
      { name: "Rolled Oats", quantity: "1/4 cup" },
    ],
  },

  // Lunches
  {
    name: "Turkey Sandwich",
    description: "Classic turkey sandwich with lettuce and tomato.",
    instructions: [
      "Spread mustard on bread.",
      "Layer turkey, lettuce, and tomato.",
      "Close sandwich and serve.",
    ],
    mealTypes: ["lunch"],
    ingredients: [
      { name: "Bread", quantity: "2 slices" },
      { name: "Turkey", quantity: "4 oz" },
      { name: "Lettuce", quantity: "2 leaves" },
      { name: "Tomato", quantity: "4 slices" },
      { name: "Mustard", quantity: "1 tbsp" },
    ],
  },
  {
    name: "Chicken Caesar Wrap",
    description: "Chicken wrap with romaine and Caesar dressing.",
    instructions: [
      "Lay tortilla flat.",
      "Add chicken, romaine, parmesan, and dressing.",
      "Wrap tightly and slice in half.",
    ],
    mealTypes: ["lunch"],
    ingredients: [
      { name: "Tortilla", quantity: "1" },
      { name: "Chicken Breast", quantity: "4 oz" },
      { name: "Romaine", quantity: "1 cup" },
      { name: "Parmesan", quantity: "2 tbsp" },
      { name: "Caesar Dressing", quantity: "2 tbsp" },
    ],
  },
  {
    name: "Tomato Soup and Grilled Cheese",
    description: "Comfort lunch combo.",
    instructions: [
      "Heat tomato soup in a saucepan.",
      "Butter the bread and add cheese between slices.",
      "Grill sandwich until golden and melted.",
      "Serve with soup.",
    ],
    mealTypes: ["lunch"],
    ingredients: [
      { name: "Tomato Soup", quantity: "2 cups" },
      { name: "Bread", quantity: "2 slices" },
      { name: "Cheddar Cheese", quantity: "2 slices" },
      { name: "Butter", quantity: "1 tbsp" },
    ],
  },
  {
    name: "Quinoa Chickpea Salad",
    description: "Protein-packed salad with lemon dressing.",
    instructions: [
      "Cook quinoa and let it cool slightly.",
      "Combine quinoa, chickpeas, cucumber, and tomatoes.",
      "Toss with olive oil and lemon juice.",
      "Serve chilled or at room temperature.",
    ],
    mealTypes: ["lunch"],
    ingredients: [
      { name: "Quinoa", quantity: "1 cup" },
      { name: "Chickpeas", quantity: "1 can" },
      { name: "Cucumber", quantity: "1/2 cup" },
      { name: "Cherry Tomatoes", quantity: "1/2 cup" },
      { name: "Olive Oil", quantity: "1 tbsp" },
      { name: "Lemon Juice", quantity: "1 tbsp" },
    ],
  },
  {
    name: "Tuna Salad Bowl",
    description: "Light tuna salad over greens.",
    instructions: [
      "Mix tuna, mayonnaise, and celery.",
      "Place mixed greens in a bowl.",
      "Top with tuna salad and serve.",
    ],
    mealTypes: ["lunch"],
    ingredients: [
      { name: "Tuna", quantity: "1 can" },
      { name: "Mayonnaise", quantity: "2 tbsp" },
      { name: "Celery", quantity: "1/4 cup" },
      { name: "Mixed Greens", quantity: "2 cups" },
    ],
  },
  {
    name: "Caprese Sandwich",
    description: "Mozzarella, tomato, and basil sandwich.",
    instructions: [
      "Spread pesto on bread.",
      "Layer mozzarella, tomato, and basil.",
      "Close sandwich and serve.",
    ],
    mealTypes: ["lunch"],
    ingredients: [
      { name: "Bread", quantity: "2 slices" },
      { name: "Mozzarella", quantity: "3 slices" },
      { name: "Tomato", quantity: "4 slices" },
      { name: "Basil", quantity: "4 leaves" },
      { name: "Pesto", quantity: "1 tbsp" },
    ],
  },
  {
    name: "Veggie Rice Bowl",
    description: "Rice bowl with roasted vegetables.",
    instructions: [
      "Cook the rice.",
      "Roast or sauté the vegetables until tender.",
      "Serve vegetables over rice.",
      "Drizzle with soy sauce.",
    ],
    mealTypes: ["lunch"],
    ingredients: [
      { name: "Rice", quantity: "1 cup" },
      { name: "Broccoli", quantity: "1 cup" },
      { name: "Carrots", quantity: "1/2 cup" },
      { name: "Bell Pepper", quantity: "1/2 cup" },
      { name: "Soy Sauce", quantity: "1 tbsp" },
    ],
  },

  // Dinners
  {
    name: "Spaghetti Bolognese",
    description: "Pasta with meat sauce.",
    instructions: [
      "Cook spaghetti according to package instructions.",
      "Brown ground beef with onion.",
      "Add tomato sauce and simmer.",
      "Serve sauce over spaghetti.",
    ],
    mealTypes: ["dinner"],
    ingredients: [
      { name: "Spaghetti", quantity: "8 oz" },
      { name: "Ground Beef", quantity: "1 lb" },
      { name: "Onion", quantity: "1/2 cup" },
      { name: "Tomato Sauce", quantity: "1 (16 fl oz) can" },
      { name: "Olive Oil", quantity: "1 tbsp" },
    ],
  },
  {
    name: "Grilled Chicken with Rice",
    description: "Grilled chicken served with rice and vegetables.",
    instructions: [
      "Season the chicken.",
      "Grill until cooked through.",
      "Cook rice and steam broccoli.",
      "Serve together.",
    ],
    mealTypes: ["dinner"],
    ingredients: [
      { name: "Chicken Breast", quantity: "2 large" },
      { name: "Rice", quantity: "1 cup" },
      { name: "Broccoli", quantity: "2 cups" },
      { name: "Olive Oil", quantity: "1 tbsp" },
      { name: "Salt", quantity: "to taste" },
    ],
  },
  {
    name: "Beef Tacos",
    description: "Seasoned beef tacos with toppings.",
    instructions: [
      "Cook ground beef until browned.",
      "Add taco seasoning and stir well.",
      "Warm tortillas.",
      "Assemble tacos with lettuce, cheese, and salsa.",
    ],
    mealTypes: ["dinner"],
    ingredients: [
      { name: "Ground Beef", quantity: "1 lb" },
      { name: "Tortilla", quantity: "6" },
      { name: "Lettuce", quantity: "1 cup" },
      { name: "Cheddar Cheese", quantity: "1/2 cup" },
      { name: "Salsa", quantity: "1/2 cup" },
    ],
  },
  {
    name: "Baked Salmon and Potatoes",
    description: "Salmon fillets with roasted potatoes.",
    instructions: [
      "Heat oven to 400°F.",
      "Roast potatoes with olive oil until tender.",
      "Bake salmon until flaky.",
      "Serve with lemon.",
    ],
    mealTypes: ["dinner"],
    ingredients: [
      { name: "Salmon", quantity: "2 fillets" },
      { name: "Potatoes", quantity: "1 lb" },
      { name: "Olive Oil", quantity: "2 tbsp" },
      { name: "Lemon", quantity: "1" },
    ],
  },
  {
    name: "Chicken Stir Fry",
    description: "Quick stir fry with chicken and vegetables.",
    instructions: [
      "Cook chicken in a hot pan.",
      "Add vegetables and stir fry until crisp-tender.",
      "Add soy sauce.",
      "Serve with rice.",
    ],
    mealTypes: ["dinner"],
    ingredients: [
      { name: "Chicken Breast", quantity: "1 lb" },
      { name: "Broccoli", quantity: "1 cup" },
      { name: "Bell Pepper", quantity: "1 cup" },
      { name: "Soy Sauce", quantity: "2 tbsp" },
      { name: "Rice", quantity: "1 cup" },
    ],
  },
  {
    name: "Vegetable Curry",
    description: "Creamy vegetable curry over rice.",
    instructions: [
      "Cook carrots and potatoes until slightly tender.",
      "Stir in curry paste.",
      "Add coconut milk and simmer.",
      "Serve over rice.",
    ],
    mealTypes: ["dinner"],
    ingredients: [
      { name: "Coconut Milk", quantity: "1 can" },
      { name: "Curry Paste", quantity: "2 tbsp" },
      { name: "Carrots", quantity: "1 cup" },
      { name: "Potatoes", quantity: "2 cups" },
      { name: "Rice", quantity: "1 cup" },
    ],
  },
  {
    name: "Sheet Pan Sausage and Veggies",
    description: "Roasted sausage with vegetables.",
    instructions: [
      "Heat oven to 425°F.",
      "Toss sausage and vegetables with olive oil.",
      "Spread on a sheet pan.",
      "Roast until browned and cooked through.",
    ],
    mealTypes: ["dinner"],
    ingredients: [
      { name: "Sausage", quantity: "12 oz" },
      { name: "Bell Pepper", quantity: "2" },
      { name: "Zucchini", quantity: "2" },
      { name: "Olive Oil", quantity: "1 tbsp" },
      { name: "Salt", quantity: "to taste" },
    ],
  },
];

async function upsertIngredient(name: string) {
  return prisma.ingredient.upsert({
    where: { name },
    update: {},
    create: { name },
  });
}

async function createRecipe(recipe: SeedRecipe) {
  const createdRecipe = await prisma.recipe.create({
    data: {
      name: recipe.name,
      description: recipe.description,
      instructions: recipe.instructions,
      mealTypes: recipe.mealTypes,
    },
  });

  for (const item of recipe.ingredients) {
    const ingredient = await upsertIngredient(item.name);

    await prisma.recipeIngredient.create({
      data: {
        recipeId: createdRecipe.id,
        ingredientId: ingredient.id,
        quantity: item.quantity,
      },
    });
  }

  return createdRecipe;
}

async function main() {
  await prisma.recipeIngredient.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.ingredient.deleteMany();

  for (const recipe of recipes) {
    await createRecipe(recipe);
  }

  console.log(`Seeded ${recipes.length} recipes.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });