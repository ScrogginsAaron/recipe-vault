import jsPDF from "jspdf";

type IngredientSummaryItem = {
  name: string;
  totalQuantity: string | null;
  notes?: string[];
};

type Meal = {
  name: string;
};

type MenuDay = {
  day: string;
  date: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
  };
};

type WeeklyMenuData = {
  menu: MenuDay[];
  ingredientsSummary: IngredientSummaryItem[];
};

function formatDisplayDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

export function exportWeeklyMenuPdf(data: WeeklyMenuData) {
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
  doc.text("RecipeVault Weekly Meal Plan", marginX, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  if (data.menu.length > 0) {
    const firstDate = data.menu[0].date;
    const lastDate = data.menu[data.menu.length - 1].date;
    doc.text(
      `Plan range: ${formatDisplayDate(firstDate)} - ${formatDisplayDate(lastDate)}`,
      marginX,
      y
    );
    y += 10;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Weekly Menu", marginX, y);
  y += 8;

  data.menu.forEach((dayItem) => {
    ensureSpace(36);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${dayItem.day} - ${formatDisplayDate(dayItem.date)}`, marginX, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    y = addWrappedText(
      doc,
      `Breakfast: ${dayItem.meals.breakfast.name}`,
      marginX + 4,
      y,
      maxWidth - 4
    );
    y = addWrappedText(
      doc,
      `Lunch: ${dayItem.meals.lunch.name}`,
      marginX + 4,
      y,
      maxWidth -4
    );
    y = addWrappedText(
      doc,
      `Dinner: ${dayItem.meals.dinner.name}`,
      marginX + 4,
      y,
      maxWidth -4
    );

    y += 4;
  });

  ensureSpace(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Ingredient Summary", marginX, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  data.ingredientsSummary.forEach((item) => {
    ensureSpace(18);

    const quantityText = item.totalQuantity ?? "Could not combine";
    y = addWrappedText(
      doc,
      `${item.name}: ${quantityText}`,
      marginX,
      y,
      maxWidth
    );

    if (item.notes && item.notes.length > 0) {
      y = addWrappedText(
        doc,
        `Notes: ${item.notes.join(", ")}`,
        marginX + 4,
        y,
        maxWidth - 4
      );
    }

    y += 2;
  });
  const fileStart = data.menu[0]?.date ?? "weekly-menu";
  doc.save(`recipevault-menu-${fileStart}.pdf`);
}