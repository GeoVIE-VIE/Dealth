# Dealth - Nutrition Data Ingestion Pipeline

A data-ingestion pipeline for building a comprehensive, normalized nutrition database. The system prioritizes official structured sources and uses web scraping only as a fallback, anchoring all data to universal product identifiers.

## Architecture Overview

```
GTIN / UPC / GS1 Digital Link
  -> Product Record
       -> Nutrition Facts
       -> Ingredient Tree
       -> Allergen Flags
       -> Portion Calculator
```

Everything is anchored to a universal product ID (GTIN/UPC), not product names. Over time the system will adopt GS1 Digital Link / 2D barcodes for richer consumer-facing experiences.

## Data Source Tiers

| Tier | Source | Purpose |
|------|--------|---------|
| 1 | Official APIs & datasets (USDA FoodData Central) | Base nutrition reference data (public domain / CC0) |
| 2 | Manufacturer product pages & feeds | Direct, machine-readable product records |
| 3 | Retailer structured data & catalog feeds | Supplementary product coverage |
| 4 | Community / open databases (Open Food Facts) | Gap-filling for ingredients and broader product coverage |
| 5 | OCR / scraping from package images | Last-resort acquisition for missing products |

### Key Sources

- **USDA FoodData Central** - Provides nutrients, food identifiers, and standardized food composition via API and downloadable datasets. Public domain under CC0.
- **Open Food Facts** - API-accessible community database useful for breadth, especially ingredients and product coverage. Not an official U.S. regulatory source.
- **FDA Label Rules** - Defines what must appear on labels and how serving sizes work. Serving sizes are based on amounts people actually consume, which informs the portion calculator.

## Product Schema

Every product record is normalized into a consistent schema:

```json
{
  "product_id": "gtin-or-upc",
  "name": "Example Product",
  "brand": "Example Brand",
  "serving_size": { "value": 28, "unit": "g" },
  "servings_per_container": 8,
  "nutrition_per_serving": {},
  "nutrition_per_100g": {},
  "ingredients_raw": "Whole grain oats, sugar, ...",
  "ingredients_structured": [],
  "allergens": [],
  "source": {
    "type": "manufacturer_page",
    "url": "..."
  }
}
```

### Captured Fields

- Product name, UPC/GTIN, brand
- Serving size + unit, servings per container
- Calories, macronutrients, sodium, sugar, fiber
- Ingredient statement (raw text)
- Allergen statement

## Ingredient Parser

Ingredient lists are parsed from flat text with nested parentheticals into structured trees.

**Input:**
```
Chocolate chips (sugar, cocoa butter, soy lecithin)
```

**Output:**
```
chocolate chips
  ├── sugar
  ├── cocoa butter
  └── soy lecithin
```

The parser:
- Splits on commas with parenthesis awareness
- Preserves nesting structure
- Standardizes synonyms
- Maps ingredients to a controlled vocabulary

This enables:
- Allergy detection
- Additive detection
- Diet filters (vegan, keto, etc.)
- "Ultra-processed" heuristics

## Absorption & Personalized Estimates

Absorption is **not** a scraped field. FDA labels provide declared nutrient values and serving conventions, not personalized absorption data.

The pipeline handles this in two layers:

1. **Data layer** - Ingest declared nutrients as-is from labels and APIs
2. **Application layer** - Calculate estimated absorbed / net impact separately

Examples of app-layer calculations:
- Net carbs from total carbs minus fiber
- Adjusted bioavailability heuristics
- Personalized estimates based on user health profile

## Provenance & Confidence Scoring

Every field carries metadata for auditability:

| Field | Attributes |
|-------|------------|
| Source | Where the data came from |
| Timestamp | When it was acquired |
| Method | How it was acquired (API, scrape, OCR, inferred) |
| Confidence | High / Medium / Low score |

**Examples:**

| Data Point | Source | Confidence |
|------------|--------|------------|
| Calories | Manufacturer page | High |
| Ingredient sub-tree | Parsed from text | Medium |
| Additive classification | Inferred | Medium |

## System Components

| Component | Description |
|-----------|-------------|
| **Product Schema** | Normalized data model anchored to GTIN/UPC |
| **Ingredient Parser** | Converts flat ingredient text into structured trees |
| **Portion Calculator** | Computes per-serving and per-unit nutrition using FDA serving conventions |
| **Source-Confidence Layer** | Tracks provenance, timestamps, and confidence for every field |
| **Data Ingestion Pipeline** | Multi-tier ingestion from APIs, feeds, and selective scraping |

## Legal & Compliance

- Uses public-domain and licensed APIs first
- Respects `robots.txt` and terms of service on crawled sites
- Stores source URLs and retrieval dates for all acquired data
- Avoids depending on brittle HTML scraping for core infrastructure
- Designed with data provenance, reproducibility, and permissions in mind for potential public-health use

## First Milestone

The initial prototype targets:

- **100 packaged foods** with complete records
- **One clean schema** for all product data
- **Working QR/barcode lookup** via GTIN/UPC
- **Accurate portion calculations** using FDA serving conventions

### Recommended 3-Source Ingestion Stack

1. **USDA FoodData Central** - Base nutrition reference data
2. **Open Food Facts** - Broader product/ingredient coverage where official data is missing
3. **Selective manufacturer-page scraping** - Targeted coverage for demo products

## Scraping Guidelines

Scraping is treated strictly as input acquisition, not as the core data asset. When scraping is necessary:

- Target pages with consistent, structured markup only
- Normalize all scraped data into the product schema immediately
- Never scrape arbitrary text blobs
- Always record the source URL and retrieval date
- The normalized database is the real asset, not the scraped HTML
