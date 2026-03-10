import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(__dirname, "../../dealth.db");

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

export function initDb(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      food_id TEXT PRIMARY KEY,
      product_name TEXT NOT NULL,
      brand TEXT NOT NULL,
      manufacturer TEXT,
      category TEXT,
      barcode_type TEXT NOT NULL DEFAULT 'upc_a',
      serving_size_value REAL NOT NULL,
      serving_size_unit TEXT NOT NULL,
      serving_size_description TEXT,
      servings_per_container REAL NOT NULL,
      ingredients_raw TEXT NOT NULL,
      ingredients_structured TEXT NOT NULL, -- JSON
      allergens TEXT NOT NULL DEFAULT '[]', -- JSON array
      additives TEXT DEFAULT '[]', -- JSON array
      serving_conversions TEXT DEFAULT '[]', -- JSON array
      source_type TEXT NOT NULL,
      source_url TEXT,
      source_retrieved_at TEXT,
      source_fdc_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS nutrition (
      food_id TEXT NOT NULL,
      per_type TEXT NOT NULL CHECK(per_type IN ('serving', '100g')),
      calories REAL,
      total_fat REAL,
      saturated_fat REAL,
      trans_fat REAL,
      cholesterol REAL,
      sodium REAL,
      total_carbohydrate REAL,
      dietary_fiber REAL,
      total_sugars REAL,
      added_sugars REAL,
      protein REAL,
      vitamin_d REAL,
      calcium REAL,
      iron REAL,
      potassium REAL,
      PRIMARY KEY (food_id, per_type),
      FOREIGN KEY (food_id) REFERENCES products(food_id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(product_name);
  `);
}
