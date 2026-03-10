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

## Implementation Roadmap

### Phase 1 — Write the Core Idea (Week 1-2)

Before building anything, create a clear concept document. This becomes the foundation for everything else.

The concept paper should explain:

1. **The Problem** — Confusing serving sizes, hidden ingredient complexity, lack of machine-readable food data, difficulty tracking real nutrition intake
2. **The Solution** — A national QR-based digital nutrition system where every packaged food links to a machine-readable database containing ingredients, nutrients, and portion calculations
3. **What the System Does** — Scan food, input portion, calculate intake, detect allergens, analyze additives
4. **Why It Helps Public Health** — Better diet tracking, diabetes management, obesity reduction, improved research data

See [`CONCEPT_PAPER.md`](CONCEPT_PAPER.md) for the full concept document.

> **If you do only one thing, do this:** Write a 2-3 page concept paper explaining the system clearly. That becomes your blueprint, something you can show collaborators, and the basis for research or funding.

### Phase 2 — Define the Data Standard

The biggest innovation is defining how food data should be structured.

| Field | Description |
|-------|-------------|
| FoodID | Universal product identifier (GTIN/UPC) |
| ProductName | Human-readable product name |
| Manufacturer | Brand / manufacturer name |
| NutritionPer100g | Standardized nutrition facts |
| IngredientTree | Structured ingredient hierarchy |
| Allergens | Declared allergen flags |
| Additives | Classified additive list |
| ServingConversions | Portion calculation mappings |

This builds on how USDA FoodData Central stores food composition data, but adds structured ingredient hierarchies and portion calculations.

See [`DATA_STANDARD.md`](DATA_STANDARD.md) for the full data standard specification.

### Phase 3 — Build a Simple Prototype

A simple prototype demonstrates the concept end-to-end:

```
scan QR
  ↓
product page opens
  ↓
user enters portion eaten
  ↓
nutrition automatically calculated
```

The initial prototype targets:

- **100 packaged foods** with complete records
- **One clean schema** for all product data
- **Working QR/barcode lookup** via GTIN/UPC
- **Accurate portion calculations** using FDA serving conventions

**Recommended 3-Source Ingestion Stack:**

1. **USDA FoodData Central** — Base nutrition reference data
2. **Open Food Facts** — Broader product/ingredient coverage where official data is missing
3. **Selective manufacturer-page scraping** — Targeted coverage for demo products

Even a basic website demo helps people understand the concept.

### Phase 4 — Share the Idea Publicly

Once there is a concept + demo, start showing it to people:

- Health researchers
- Nutritionists
- Public health groups
- Open food data communities

Organizations like the Centers for Disease Control and Prevention (CDC) and the National Institutes of Health (NIH) often explore new nutrition tracking ideas.

### Phase 5 — Build a Coalition

Big infrastructure ideas succeed when multiple groups support them.

Possible allies:

- Doctors and clinical practitioners
- Diabetes associations
- Nutrition researchers
- Food transparency advocates

When several groups support an idea, policymakers start paying attention.

### Phase 6 — Policy Proposal

Eventually the idea could evolve into a policy proposal for agencies like:

- **U.S. Food and Drug Administration (FDA)**
- **United States Department of Agriculture (USDA)**

That stage may be years away, but the early groundwork is essential.

## Scraping Guidelines

Scraping is treated strictly as input acquisition, not as the core data asset. When scraping is necessary:

- Target pages with consistent, structured markup only
- Normalize all scraped data into the product schema immediately
- Never scrape arbitrary text blobs
- Always record the source URL and retrieval date
- The normalized database is the real asset, not the scraped HTML
