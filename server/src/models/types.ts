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
  percentage?: number;
  vocabulary_id?: string;
}

export interface Additive {
  name: string;
  category:
    | "preservative"
    | "coloring"
    | "sweetener"
    | "emulsifier"
    | "stabilizer"
    | "flavor_enhancer"
    | "antioxidant"
    | "other";
  e_number?: string;
  source_ingredient: string;
}

export interface ServingConversion {
  unit: string;
  grams: number;
  source: string;
}

export interface Source {
  type:
    | "usda_fdc"
    | "open_food_facts"
    | "manufacturer_api"
    | "manufacturer_page"
    | "retailer_catalog"
    | "ocr_label"
    | "manual_entry";
  url?: string;
  retrieved_at?: string;
  fdc_id?: string;
}

export interface Product {
  food_id: string;
  product_name: string;
  brand: string;
  manufacturer?: string;
  category?: string;
  barcode_type: string;
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
  source: Source;
  created_at: string;
  updated_at: string;
}
