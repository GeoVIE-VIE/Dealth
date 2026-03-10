import { initDb } from "./db/schema";
import { upsertProduct } from "./services/productService";
import {
  parseIngredients,
  detectAllergens,
  detectAdditives,
} from "./services/ingredientParser";
import { Product, NutritionFacts } from "./models/types";

// Helper to auto-compute 100g nutrition from per-serving values
function to100g(
  perServing: NutritionFacts,
  servingGrams: number
): NutritionFacts {
  const factor = 100 / servingGrams;
  const result: Record<string, number | null> = {};
  for (const [key, value] of Object.entries(perServing)) {
    result[key] =
      value !== null ? Math.round(value * factor * 10) / 10 : null;
  }
  return result as unknown as NutritionFacts;
}

function buildProduct(
  data: Omit<
    Product,
    | "ingredients_structured"
    | "allergens"
    | "additives"
    | "nutrition_per_100g"
    | "created_at"
    | "updated_at"
  >
): Product {
  const structured = parseIngredients(data.ingredients_raw);
  const allergens = detectAllergens(structured);
  const additives = detectAdditives(structured);
  const now = new Date().toISOString();

  return {
    ...data,
    ingredients_structured: structured,
    allergens,
    additives: additives as Product["additives"],
    nutrition_per_100g: to100g(
      data.nutrition_per_serving,
      data.serving_size.value
    ),
    created_at: now,
    updated_at: now,
  };
}

const products: ReturnType<typeof buildProduct>[] = [
  buildProduct({
    food_id: "0016000275287",
    product_name: "Honey Nut Cheerios",
    brand: "Cheerios",
    manufacturer: "General Mills",
    category: "cereal",
    barcode_type: "upc_a",
    serving_size: { value: 39, unit: "g" },
    serving_size_description: "About 1 1/2 cups",
    servings_per_container: 9,
    nutrition_per_serving: {
      calories: 140,
      total_fat: 2,
      saturated_fat: 0,
      trans_fat: 0,
      cholesterol: 0,
      sodium: 190,
      total_carbohydrate: 30,
      dietary_fiber: 3,
      total_sugars: 12,
      added_sugars: 12,
      protein: 3,
      vitamin_d: 2,
      calcium: 130,
      iron: 9,
      potassium: 200,
    },
    ingredients_raw:
      "Whole grain oats, sugar, oat bran, modified corn starch, honey, brown sugar syrup, salt, tripotassium phosphate, canola oil, natural almond flavor, vitamin E (mixed tocopherols) added to preserve freshness",
    serving_conversions: [
      { unit: "cup", grams: 26, source: "manufacturer_page" },
    ],
    source: {
      type: "manual_entry",
      retrieved_at: new Date().toISOString(),
    },
  }),

  buildProduct({
    food_id: "0028400090971",
    product_name: "Doritos Nacho Cheese",
    brand: "Doritos",
    manufacturer: "Frito-Lay",
    category: "snack",
    barcode_type: "upc_a",
    serving_size: { value: 28, unit: "g" },
    serving_size_description: "About 12 chips",
    servings_per_container: 8,
    nutrition_per_serving: {
      calories: 140,
      total_fat: 8,
      saturated_fat: 1,
      trans_fat: 0,
      cholesterol: 0,
      sodium: 210,
      total_carbohydrate: 16,
      dietary_fiber: 1,
      total_sugars: 1,
      added_sugars: 0,
      protein: 2,
      vitamin_d: 0,
      calcium: 20,
      iron: 0.4,
      potassium: 50,
    },
    ingredients_raw:
      "Corn, vegetable oil (corn, canola, and/or sunflower oil), maltodextrin (made from corn), salt, cheddar cheese (milk, cheese cultures, salt, enzymes), whey, monosodium glutamate, buttermilk, romano cheese (part-skim cow's milk, cheese cultures, salt, enzymes), whey protein concentrate, onion powder, corn flour, natural and artificial flavor, dextrose, tomato powder, lactose, spices, artificial color (yellow 6, yellow 5, red 40), lactic acid, citric acid, sugar, garlic powder, skim milk, red and green bell pepper powder, disodium inosinate, disodium guanylate",
    serving_conversions: [
      { unit: "chip", grams: 2.3, source: "manual_entry" },
    ],
    source: {
      type: "manual_entry",
      retrieved_at: new Date().toISOString(),
    },
  }),

  buildProduct({
    food_id: "0049000006582",
    product_name: "Coca-Cola Classic",
    brand: "Coca-Cola",
    manufacturer: "The Coca-Cola Company",
    category: "beverage",
    barcode_type: "upc_a",
    serving_size: { value: 360, unit: "ml" },
    serving_size_description: "1 can (12 fl oz)",
    servings_per_container: 1,
    nutrition_per_serving: {
      calories: 140,
      total_fat: 0,
      saturated_fat: 0,
      trans_fat: 0,
      cholesterol: 0,
      sodium: 45,
      total_carbohydrate: 39,
      dietary_fiber: 0,
      total_sugars: 39,
      added_sugars: 39,
      protein: 0,
      vitamin_d: 0,
      calcium: 0,
      iron: 0,
      potassium: 0,
    },
    ingredients_raw:
      "Carbonated water, high fructose corn syrup, caramel color, phosphoric acid, natural flavors, caffeine",
    serving_conversions: [
      { unit: "can", grams: 360, source: "manufacturer_page" },
      { unit: "bottle", grams: 591, source: "manufacturer_page" },
    ],
    source: {
      type: "manual_entry",
      retrieved_at: new Date().toISOString(),
    },
  }),

  buildProduct({
    food_id: "0044000032197",
    product_name: "Oreo Chocolate Sandwich Cookies",
    brand: "Oreo",
    manufacturer: "Mondelez International",
    category: "cookie",
    barcode_type: "upc_a",
    serving_size: { value: 34, unit: "g" },
    serving_size_description: "3 cookies",
    servings_per_container: 13,
    nutrition_per_serving: {
      calories: 160,
      total_fat: 7,
      saturated_fat: 2,
      trans_fat: 0,
      cholesterol: 0,
      sodium: 135,
      total_carbohydrate: 25,
      dietary_fiber: 1,
      total_sugars: 14,
      added_sugars: 14,
      protein: 1,
      vitamin_d: 0,
      calcium: 0,
      iron: 3.6,
      potassium: 55,
    },
    ingredients_raw:
      "Sugar, unbleached enriched flour (wheat flour, niacin, reduced iron, thiamine mononitrate, riboflavin, folic acid), palm and/or canola oil, cocoa (processed with alkali), high fructose corn syrup, leavening (baking soda, calcium phosphate), corn starch, salt, soy lecithin, vanillin, chocolate",
    serving_conversions: [
      { unit: "cookie", grams: 11.3, source: "manual_entry" },
    ],
    source: {
      type: "manual_entry",
      retrieved_at: new Date().toISOString(),
    },
  }),

  buildProduct({
    food_id: "0038000138416",
    product_name: "Frosted Flakes",
    brand: "Kellogg's",
    manufacturer: "Kellogg Company",
    category: "cereal",
    barcode_type: "upc_a",
    serving_size: { value: 41, unit: "g" },
    serving_size_description: "1 1/3 cups",
    servings_per_container: 10,
    nutrition_per_serving: {
      calories: 150,
      total_fat: 0,
      saturated_fat: 0,
      trans_fat: 0,
      cholesterol: 0,
      sodium: 190,
      total_carbohydrate: 37,
      dietary_fiber: 1,
      total_sugars: 15,
      added_sugars: 15,
      protein: 2,
      vitamin_d: 2,
      calcium: 0,
      iron: 8.1,
      potassium: 30,
    },
    ingredients_raw:
      "Milled corn, sugar, malt flavoring, high fructose corn syrup, salt, sodium ascorbate and ascorbic acid (vitamin C), niacinamide, reduced iron, pyridoxine hydrochloride (vitamin B6), riboflavin (vitamin B2), thiamin hydrochloride (vitamin B1), folic acid, vitamin A palmitate, BHT (added to packaging for freshness), vitamin B12, vitamin D",
    serving_conversions: [
      { unit: "cup", grams: 31, source: "manufacturer_page" },
    ],
    source: {
      type: "manual_entry",
      retrieved_at: new Date().toISOString(),
    },
  }),

  buildProduct({
    food_id: "0021130126026",
    product_name: "365 Organic Whole Milk",
    brand: "365 by Whole Foods Market",
    manufacturer: "Whole Foods Market",
    category: "dairy",
    barcode_type: "upc_a",
    serving_size: { value: 240, unit: "ml" },
    serving_size_description: "1 cup (8 fl oz)",
    servings_per_container: 8,
    nutrition_per_serving: {
      calories: 150,
      total_fat: 8,
      saturated_fat: 5,
      trans_fat: 0,
      cholesterol: 35,
      sodium: 125,
      total_carbohydrate: 12,
      dietary_fiber: 0,
      total_sugars: 12,
      added_sugars: 0,
      protein: 8,
      vitamin_d: 3,
      calcium: 300,
      iron: 0,
      potassium: 380,
    },
    ingredients_raw: "Organic grade A milk, vitamin D3",
    serving_conversions: [
      { unit: "cup", grams: 240, source: "manufacturer_page" },
    ],
    source: {
      type: "manual_entry",
      retrieved_at: new Date().toISOString(),
    },
  }),

  buildProduct({
    food_id: "0011110838728",
    product_name: "Kroger Large White Eggs",
    brand: "Kroger",
    manufacturer: "Kroger Co.",
    category: "eggs",
    barcode_type: "upc_a",
    serving_size: { value: 50, unit: "g" },
    serving_size_description: "1 egg",
    servings_per_container: 12,
    nutrition_per_serving: {
      calories: 70,
      total_fat: 5,
      saturated_fat: 1.5,
      trans_fat: 0,
      cholesterol: 185,
      sodium: 70,
      total_carbohydrate: 0,
      dietary_fiber: 0,
      total_sugars: 0,
      added_sugars: 0,
      protein: 6,
      vitamin_d: 1,
      calcium: 28,
      iron: 0.9,
      potassium: 69,
    },
    ingredients_raw: "Egg",
    serving_conversions: [
      { unit: "egg", grams: 50, source: "usda_fdc" },
    ],
    source: {
      type: "manual_entry",
      retrieved_at: new Date().toISOString(),
    },
  }),

  buildProduct({
    food_id: "0014100096108",
    product_name: "Pepperidge Farm Whole Grain White Bread",
    brand: "Pepperidge Farm",
    manufacturer: "Campbell Soup Company",
    category: "bread",
    barcode_type: "upc_a",
    serving_size: { value: 43, unit: "g" },
    serving_size_description: "1 slice",
    servings_per_container: 16,
    nutrition_per_serving: {
      calories: 110,
      total_fat: 1.5,
      saturated_fat: 0,
      trans_fat: 0,
      cholesterol: 0,
      sodium: 180,
      total_carbohydrate: 21,
      dietary_fiber: 2,
      total_sugars: 3,
      added_sugars: 3,
      protein: 4,
      vitamin_d: 0,
      calcium: 60,
      iron: 1.8,
      potassium: 60,
    },
    ingredients_raw:
      "Unbleached enriched wheat flour (flour, niacin, reduced iron, thiamine mononitrate, riboflavin, folic acid), water, whole wheat flour, sugar, yeast, contains 2% or less of: soybean oil, salt, calcium propionate (to retain freshness), mono and diglycerides, wheat gluten, soy lecithin",
    serving_conversions: [
      { unit: "slice", grams: 43, source: "manufacturer_page" },
    ],
    source: {
      type: "manual_entry",
      retrieved_at: new Date().toISOString(),
    },
  }),

  buildProduct({
    food_id: "0012000001086",
    product_name: "Lay's Classic Potato Chips",
    brand: "Lay's",
    manufacturer: "Frito-Lay",
    category: "snack",
    barcode_type: "upc_a",
    serving_size: { value: 28, unit: "g" },
    serving_size_description: "About 15 chips",
    servings_per_container: 10,
    nutrition_per_serving: {
      calories: 160,
      total_fat: 10,
      saturated_fat: 1.5,
      trans_fat: 0,
      cholesterol: 0,
      sodium: 170,
      total_carbohydrate: 15,
      dietary_fiber: 1,
      total_sugars: 0,
      added_sugars: 0,
      protein: 2,
      vitamin_d: 0,
      calcium: 0,
      iron: 0.4,
      potassium: 350,
    },
    ingredients_raw: "Potatoes, vegetable oil (canola, corn, soybean, and/or sunflower oil), salt",
    serving_conversions: [
      { unit: "chip", grams: 1.9, source: "manual_entry" },
    ],
    source: {
      type: "manual_entry",
      retrieved_at: new Date().toISOString(),
    },
  }),

  buildProduct({
    food_id: "0041196910759",
    product_name: "Nature Valley Oats 'n Honey Granola Bars",
    brand: "Nature Valley",
    manufacturer: "General Mills",
    category: "snack bar",
    barcode_type: "upc_a",
    serving_size: { value: 42, unit: "g" },
    serving_size_description: "2 bars",
    servings_per_container: 6,
    nutrition_per_serving: {
      calories: 190,
      total_fat: 6,
      saturated_fat: 1,
      trans_fat: 0,
      cholesterol: 0,
      sodium: 160,
      total_carbohydrate: 29,
      dietary_fiber: 2,
      total_sugars: 11,
      added_sugars: 11,
      protein: 4,
      vitamin_d: 0,
      calcium: 20,
      iron: 1,
      potassium: 95,
    },
    ingredients_raw:
      "Whole grain oats, sugar, canola oil, rice flour, honey, salt, brown sugar syrup, baking soda, soy lecithin, natural flavor",
    serving_conversions: [
      { unit: "bar", grams: 21, source: "manufacturer_page" },
    ],
    source: {
      type: "manual_entry",
      retrieved_at: new Date().toISOString(),
    },
  }),
];

// Run seed
initDb();
console.log("Database initialized, seeding products...");

for (const product of products) {
  upsertProduct(product);
  console.log(`  Seeded: ${product.product_name} (${product.food_id})`);
}

console.log(`\nDone! Seeded ${products.length} products.`);
