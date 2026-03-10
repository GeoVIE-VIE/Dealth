const BASE = "/api";

export interface Product {
  food_id: string;
  product_name: string;
  brand: string;
  manufacturer?: string;
  category?: string;
  serving_size: { value: number; unit: string };
  serving_size_description?: string;
  servings_per_container: number;
  nutrition_per_serving: NutritionFacts;
  nutrition_per_100g: NutritionFacts;
  ingredients_raw: string;
  ingredients_structured: IngredientNode[];
  allergens: string[];
  additives: Additive[];
  serving_conversions: ServingConversion[];
  source: { type: string; url?: string; retrieved_at?: string };
}

export interface NutritionFacts {
  calories: number | null;
  total_fat: number | null;
  saturated_fat: number | null;
  trans_fat: number | null;
  cholesterol: number | null;
  sodium: number | null;
  total_carbohydrate: number | null;
  dietary_fiber: number | null;
  total_sugars: number | null;
  added_sugars: number | null;
  protein: number | null;
  vitamin_d: number | null;
  calcium: number | null;
  iron: number | null;
  potassium: number | null;
}

export interface IngredientNode {
  name: string;
  name_raw?: string;
  children?: IngredientNode[];
}

export interface Additive {
  name: string;
  category: string;
  e_number?: string;
  source_ingredient: string;
}

export interface ServingConversion {
  unit: string;
  grams: number;
  source: string;
}

export interface PortionResult {
  product: { food_id: string; product_name: string; brand: string };
  portion: {
    input: { amount: number; unit: string };
    grams: number;
    servings: number;
    nutrition: NutritionFacts;
  };
}

export async function fetchProducts(query?: string): Promise<Product[]> {
  const url = query
    ? `${BASE}/products?q=${encodeURIComponent(query)}`
    : `${BASE}/products`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchProduct(foodId: string): Promise<Product> {
  const res = await fetch(`${BASE}/products/${foodId}`);
  if (!res.ok) throw new Error("Product not found");
  return res.json();
}

export async function calculatePortion(
  foodId: string,
  amount: number,
  unit: string
): Promise<PortionResult> {
  const res = await fetch(`${BASE}/products/${foodId}/portion`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, unit }),
  });
  if (!res.ok) throw new Error("Calculation failed");
  return res.json();
}
