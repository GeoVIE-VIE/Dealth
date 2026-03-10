import { NutritionFacts, ServingConversion } from "../models/types";

export interface PortionInput {
  amount: number;
  unit: string; // "g", "oz", "cup", "serving", "piece", etc.
}

export interface PortionResult {
  input: PortionInput;
  grams: number;
  servings: number;
  nutrition: NutritionFacts;
}

const UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,
  lb: 453.592,
  pound: 453.592,
  pounds: 453.592,
  ml: 1, // approximate for water-density items
  liter: 1000,
};

export function calculatePortion(
  input: PortionInput,
  servingSizeGrams: number,
  nutritionPerServing: NutritionFacts,
  servingConversions: ServingConversion[] = []
): PortionResult {
  const unitLower = input.unit.toLowerCase();
  let grams: number;

  if (unitLower === "serving" || unitLower === "servings") {
    grams = input.amount * servingSizeGrams;
  } else if (UNIT_TO_GRAMS[unitLower] !== undefined) {
    grams = input.amount * UNIT_TO_GRAMS[unitLower];
  } else {
    // Check custom serving conversions
    const conversion = servingConversions.find(
      (c) => c.unit.toLowerCase() === unitLower
    );
    if (conversion) {
      grams = input.amount * conversion.grams;
    } else {
      // Default: treat as grams
      grams = input.amount;
    }
  }

  const servings = grams / servingSizeGrams;

  return {
    input,
    grams: Math.round(grams * 100) / 100,
    servings: Math.round(servings * 1000) / 1000,
    nutrition: scaleNutrition(nutritionPerServing, servings),
  };
}

function scaleNutrition(
  base: NutritionFacts,
  factor: number
): NutritionFacts {
  const result: Record<string, number | null> = {};
  for (const [key, value] of Object.entries(base)) {
    result[key] =
      value !== null ? Math.round(value * factor * 100) / 100 : null;
  }
  return result as unknown as NutritionFacts;
}
