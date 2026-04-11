import jsPDF from "jspdf";

type RecipeIngredient = {
  id: string;
  name: string;
  quantity: string;
};

type Recipe = {
  id: string;
  name: string;
  description?: string;
  instructions?: string[];
  createdAt?: string;
  ingredients: RecipeIngredient[];
};

function formatDisplayDate(dateString?: string) {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight = 7
) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export function exportRecipePdf(
  recipe: Recipe,
  options?: {
    day?: string;
    mealType?: string;
    date?: string;
  }
) {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const maxWidth = 180;
  let y = 18;

  const ensureSpace = (needed = 20) => {
    if (y + needed > pageHeight - 14) {
      doc.addPage();
      y = 18;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  y = addWrappedText(doc, recipe.name, marginX, y, maxWidth, 8);
  y += 2;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  if (options?.mealType || options?.day || options?.date) {
    const metaParts = [
      options.mealType
        ? options.mealType.charAt(0).toUpperCase() + options.mealType.slice(1)
        : "",
      options.date ? formatDisplayDate(options.date) : "",
    ].filter(Boolean);

    y = addWrappedText(doc, metaParts.join(" * "), marginX, y, maxWidth);
    y += 2;
  }

  if (recipe.description) {
    ensureSpace(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Description", marginX, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    y = addWrappedText(doc, recipe.description, marginX, y, maxWidth);
    y += 4;
  }

  ensureSpace(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Ingredients", marginX, y);
  y += 7;
 
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  if (!recipe.ingredients.length) {
    doc.text("No ingredients listed.", marginX, y);
    y += 7;
  } else {
    recipe.ingredients.forEach((ingredient) => {
      ensureSpace(10);
      y = addWrappedText(
        doc,
        `* ${ingredient.quantity} ${ingredient.name}`,
        marginX,
        y,
        maxWidth
      );
    });
    y += 4;
  }

  ensureSpace(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Instructions", marginX, y);
  y += 7;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  if (!recipe.instructions || recipe.instructions.length === 0) {
    doc.text("No instructions provided.", marginX, y);
    y += 7;
  } else {
    recipe.instructions.forEach((step, index) => {
      ensureSpace(14);
      y = addWrappedText(doc, `${index + 1}. ${step}`, marginX, y, maxWidth);
      y += 1;
    });
  }

  const safeName = sanitizeFileName(recipe.name || "recipe");
  doc.save(`${safeName}.pdf`);
}