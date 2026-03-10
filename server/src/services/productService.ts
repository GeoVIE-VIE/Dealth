import { getDb } from "../db/schema";
import { NutritionFacts, Product } from "../models/types";

export function getAllProducts(): Product[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT p.*,
        ns.calories as ns_calories, ns.total_fat as ns_total_fat, ns.saturated_fat as ns_saturated_fat,
        ns.trans_fat as ns_trans_fat, ns.cholesterol as ns_cholesterol, ns.sodium as ns_sodium,
        ns.total_carbohydrate as ns_total_carbohydrate, ns.dietary_fiber as ns_dietary_fiber,
        ns.total_sugars as ns_total_sugars, ns.added_sugars as ns_added_sugars, ns.protein as ns_protein,
        ns.vitamin_d as ns_vitamin_d, ns.calcium as ns_calcium, ns.iron as ns_iron, ns.potassium as ns_potassium,
        n100.calories as n100_calories, n100.total_fat as n100_total_fat, n100.saturated_fat as n100_saturated_fat,
        n100.trans_fat as n100_trans_fat, n100.cholesterol as n100_cholesterol, n100.sodium as n100_sodium,
        n100.total_carbohydrate as n100_total_carbohydrate, n100.dietary_fiber as n100_dietary_fiber,
        n100.total_sugars as n100_total_sugars, n100.added_sugars as n100_added_sugars, n100.protein as n100_protein,
        n100.vitamin_d as n100_vitamin_d, n100.calcium as n100_calcium, n100.iron as n100_iron, n100.potassium as n100_potassium
      FROM products p
      LEFT JOIN nutrition ns ON p.food_id = ns.food_id AND ns.per_type = 'serving'
      LEFT JOIN nutrition n100 ON p.food_id = n100.food_id AND n100.per_type = '100g'`
    )
    .all() as any[];

  return rows.map(rowToProduct);
}

export function getProductById(foodId: string): Product | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT p.*,
        ns.calories as ns_calories, ns.total_fat as ns_total_fat, ns.saturated_fat as ns_saturated_fat,
        ns.trans_fat as ns_trans_fat, ns.cholesterol as ns_cholesterol, ns.sodium as ns_sodium,
        ns.total_carbohydrate as ns_total_carbohydrate, ns.dietary_fiber as ns_dietary_fiber,
        ns.total_sugars as ns_total_sugars, ns.added_sugars as ns_added_sugars, ns.protein as ns_protein,
        ns.vitamin_d as ns_vitamin_d, ns.calcium as ns_calcium, ns.iron as ns_iron, ns.potassium as ns_potassium,
        n100.calories as n100_calories, n100.total_fat as n100_total_fat, n100.saturated_fat as n100_saturated_fat,
        n100.trans_fat as n100_trans_fat, n100.cholesterol as n100_cholesterol, n100.sodium as n100_sodium,
        n100.total_carbohydrate as n100_total_carbohydrate, n100.dietary_fiber as n100_dietary_fiber,
        n100.total_sugars as n100_total_sugars, n100.added_sugars as n100_added_sugars, n100.protein as n100_protein,
        n100.vitamin_d as n100_vitamin_d, n100.calcium as n100_calcium, n100.iron as n100_iron, n100.potassium as n100_potassium
      FROM products p
      LEFT JOIN nutrition ns ON p.food_id = ns.food_id AND ns.per_type = 'serving'
      LEFT JOIN nutrition n100 ON p.food_id = n100.food_id AND n100.per_type = '100g'
      WHERE p.food_id = ?`
    )
    .get(foodId) as any;

  return row ? rowToProduct(row) : null;
}

export function searchProducts(query: string): Product[] {
  const db = getDb();
  const pattern = `%${query}%`;
  const rows = db
    .prepare(
      `SELECT p.*,
        ns.calories as ns_calories, ns.total_fat as ns_total_fat, ns.saturated_fat as ns_saturated_fat,
        ns.trans_fat as ns_trans_fat, ns.cholesterol as ns_cholesterol, ns.sodium as ns_sodium,
        ns.total_carbohydrate as ns_total_carbohydrate, ns.dietary_fiber as ns_dietary_fiber,
        ns.total_sugars as ns_total_sugars, ns.added_sugars as ns_added_sugars, ns.protein as ns_protein,
        ns.vitamin_d as ns_vitamin_d, ns.calcium as ns_calcium, ns.iron as ns_iron, ns.potassium as ns_potassium,
        n100.calories as n100_calories, n100.total_fat as n100_total_fat, n100.saturated_fat as n100_saturated_fat,
        n100.trans_fat as n100_trans_fat, n100.cholesterol as n100_cholesterol, n100.sodium as n100_sodium,
        n100.total_carbohydrate as n100_total_carbohydrate, n100.dietary_fiber as n100_dietary_fiber,
        n100.total_sugars as n100_total_sugars, n100.added_sugars as n100_added_sugars, n100.protein as n100_protein,
        n100.vitamin_d as n100_vitamin_d, n100.calcium as n100_calcium, n100.iron as n100_iron, n100.potassium as n100_potassium
      FROM products p
      LEFT JOIN nutrition ns ON p.food_id = ns.food_id AND ns.per_type = 'serving'
      LEFT JOIN nutrition n100 ON p.food_id = n100.food_id AND n100.per_type = '100g'
      WHERE p.product_name LIKE ? OR p.brand LIKE ? OR p.food_id LIKE ?
      LIMIT 50`
    )
    .all(pattern, pattern, pattern) as any[];

  return rows.map(rowToProduct);
}

export function upsertProduct(product: Product): void {
  const db = getDb();

  const upsertProductStmt = db.prepare(`
    INSERT OR REPLACE INTO products
      (food_id, product_name, brand, manufacturer, category, barcode_type,
       serving_size_value, serving_size_unit, serving_size_description, servings_per_container,
       ingredients_raw, ingredients_structured, allergens, additives, serving_conversions,
       source_type, source_url, source_retrieved_at, source_fdc_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const upsertNutritionStmt = db.prepare(`
    INSERT OR REPLACE INTO nutrition
      (food_id, per_type, calories, total_fat, saturated_fat, trans_fat, cholesterol, sodium,
       total_carbohydrate, dietary_fiber, total_sugars, added_sugars, protein,
       vitamin_d, calcium, iron, potassium)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    upsertProductStmt.run(
      product.food_id,
      product.product_name,
      product.brand,
      product.manufacturer || null,
      product.category || null,
      product.barcode_type,
      product.serving_size.value,
      product.serving_size.unit,
      product.serving_size_description || null,
      product.servings_per_container,
      product.ingredients_raw,
      JSON.stringify(product.ingredients_structured),
      JSON.stringify(product.allergens),
      JSON.stringify(product.additives),
      JSON.stringify(product.serving_conversions),
      product.source.type,
      product.source.url || null,
      product.source.retrieved_at || null,
      product.source.fdc_id || null,
      product.created_at,
      product.updated_at
    );

    const insertNutrition = (
      perType: string,
      n: NutritionFacts
    ) => {
      upsertNutritionStmt.run(
        product.food_id,
        perType,
        n.calories,
        n.total_fat,
        n.saturated_fat,
        n.trans_fat,
        n.cholesterol,
        n.sodium,
        n.total_carbohydrate,
        n.dietary_fiber,
        n.total_sugars,
        n.added_sugars,
        n.protein,
        n.vitamin_d,
        n.calcium,
        n.iron,
        n.potassium
      );
    };

    insertNutrition("serving", product.nutrition_per_serving);
    insertNutrition("100g", product.nutrition_per_100g);
  });

  transaction();
}

function rowToProduct(row: any): Product {
  return {
    food_id: row.food_id,
    product_name: row.product_name,
    brand: row.brand,
    manufacturer: row.manufacturer,
    category: row.category,
    barcode_type: row.barcode_type,
    serving_size: { value: row.serving_size_value, unit: row.serving_size_unit },
    serving_size_description: row.serving_size_description,
    servings_per_container: row.servings_per_container,
    nutrition_per_serving: {
      calories: row.ns_calories,
      total_fat: row.ns_total_fat,
      saturated_fat: row.ns_saturated_fat,
      trans_fat: row.ns_trans_fat,
      cholesterol: row.ns_cholesterol,
      sodium: row.ns_sodium,
      total_carbohydrate: row.ns_total_carbohydrate,
      dietary_fiber: row.ns_dietary_fiber,
      total_sugars: row.ns_total_sugars,
      added_sugars: row.ns_added_sugars,
      protein: row.ns_protein,
      vitamin_d: row.ns_vitamin_d,
      calcium: row.ns_calcium,
      iron: row.ns_iron,
      potassium: row.ns_potassium,
    },
    nutrition_per_100g: {
      calories: row.n100_calories,
      total_fat: row.n100_total_fat,
      saturated_fat: row.n100_saturated_fat,
      trans_fat: row.n100_trans_fat,
      cholesterol: row.n100_cholesterol,
      sodium: row.n100_sodium,
      total_carbohydrate: row.n100_total_carbohydrate,
      dietary_fiber: row.n100_dietary_fiber,
      total_sugars: row.n100_total_sugars,
      added_sugars: row.n100_added_sugars,
      protein: row.n100_protein,
      vitamin_d: row.n100_vitamin_d,
      calcium: row.n100_calcium,
      iron: row.n100_iron,
      potassium: row.n100_potassium,
    },
    ingredients_raw: row.ingredients_raw,
    ingredients_structured: JSON.parse(row.ingredients_structured),
    allergens: JSON.parse(row.allergens),
    additives: JSON.parse(row.additives),
    serving_conversions: JSON.parse(row.serving_conversions),
    source: {
      type: row.source_type,
      url: row.source_url,
      retrieved_at: row.source_retrieved_at,
      fdc_id: row.source_fdc_id,
    },
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
