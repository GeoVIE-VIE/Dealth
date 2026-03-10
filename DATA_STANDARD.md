# Dealth Data Standard

## Overview

This document defines the structured data standard for food product records in the Dealth system. The standard builds on how USDA FoodData Central stores food composition data, extending it with structured ingredient hierarchies, portion calculations, and provenance metadata.

---

## 1. Product Record Schema

Every food product in the system is represented as a single structured record anchored to a universal product identifier.

### Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `food_id` | string | Yes | Universal product identifier (GTIN/UPC/GS1 Digital Link) |
| `product_name` | string | Yes | Human-readable product name |
| `brand` | string | Yes | Brand or manufacturer name |
| `manufacturer` | string | No | Parent manufacturer (if different from brand) |
| `category` | string | No | Product category (e.g., "cereal", "snack", "beverage") |
| `barcode_type` | enum | Yes | One of: `upc_a`, `upc_e`, `ean_13`, `ean_8`, `gs1_digital_link` |

### Nutrition Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `serving_size` | object | Yes | `{ "value": number, "unit": string }` |
| `serving_size_description` | string | No | Human-readable serving description (e.g., "About 15 chips") |
| `servings_per_container` | number | Yes | Number of servings in the package |
| `nutrition_per_serving` | NutritionFacts | Yes | Nutrition values for one declared serving |
| `nutrition_per_100g` | NutritionFacts | Yes | Nutrition values normalized to 100 grams |

### Ingredient Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ingredients_raw` | string | Yes | Full ingredient statement as printed on label |
| `ingredients_structured` | IngredientNode[] | Yes | Parsed ingredient tree (see Section 3) |
| `allergens` | string[] | Yes | Declared allergens (FDA Big 9) |
| `additives` | Additive[] | No | Classified additive list (see Section 4) |

### Provenance Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `source` | Source | Yes | Primary data source (see Section 5) |
| `created_at` | ISO 8601 | Yes | When the record was first created |
| `updated_at` | ISO 8601 | Yes | When the record was last modified |
| `field_provenance` | map | No | Per-field source and confidence overrides |

---

## 2. NutritionFacts Object

Nutrition values follow FDA-required label fields.

| Field | Type | Unit | Description |
|-------|------|------|-------------|
| `calories` | number | kcal | Total calories |
| `total_fat` | number | g | Total fat |
| `saturated_fat` | number | g | Saturated fat |
| `trans_fat` | number | g | Trans fat |
| `cholesterol` | number | mg | Cholesterol |
| `sodium` | number | mg | Sodium |
| `total_carbohydrate` | number | g | Total carbohydrates |
| `dietary_fiber` | number | g | Dietary fiber |
| `total_sugars` | number | g | Total sugars |
| `added_sugars` | number | g | Added sugars |
| `protein` | number | g | Protein |
| `vitamin_d` | number | mcg | Vitamin D |
| `calcium` | number | mg | Calcium |
| `iron` | number | mg | Iron |
| `potassium` | number | mg | Potassium |

All values are numeric. A value of `null` means the data point is not available. A value of `0` means the nutrient is declared as zero.

---

## 3. Ingredient Tree

Ingredient lists are parsed from flat label text into a recursive tree structure.

### IngredientNode Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Ingredient name (standardized) |
| `name_raw` | string | No | Ingredient name as printed on label |
| `children` | IngredientNode[] | No | Sub-ingredients (from parenthetical content) |
| `percentage` | number | No | Declared percentage if present |
| `vocabulary_id` | string | No | Reference to controlled vocabulary entry |

### Example

**Label text:**
```
Enriched flour (wheat flour, niacin, reduced iron, thiamine mononitrate, riboflavin, folic acid), sugar, chocolate chips (sugar, chocolate liquor, cocoa butter, soy lecithin, vanilla extract), eggs, butter (cream, salt)
```

**Parsed tree:**
```json
[
  {
    "name": "enriched flour",
    "children": [
      { "name": "wheat flour" },
      { "name": "niacin" },
      { "name": "reduced iron" },
      { "name": "thiamine mononitrate" },
      { "name": "riboflavin" },
      { "name": "folic acid" }
    ]
  },
  { "name": "sugar" },
  {
    "name": "chocolate chips",
    "children": [
      { "name": "sugar" },
      { "name": "chocolate liquor" },
      { "name": "cocoa butter" },
      { "name": "soy lecithin" },
      { "name": "vanilla extract" }
    ]
  },
  { "name": "eggs" },
  {
    "name": "butter",
    "children": [
      { "name": "cream" },
      { "name": "salt" }
    ]
  }
]
```

### Parsing Rules

1. Split on commas at the top level
2. When an ingredient is followed by a parenthetical `(...)`, the contents become `children`
3. Nested parentheticals are parsed recursively
4. Ingredient names are trimmed of whitespace and lowercased
5. Synonyms are mapped to canonical names via the controlled vocabulary

---

## 4. Additive Classification

Additives detected in the ingredient tree are classified by function.

### Additive Object

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Additive name (standardized) |
| `category` | enum | One of: `preservative`, `coloring`, `sweetener`, `emulsifier`, `stabilizer`, `flavor_enhancer`, `antioxidant`, `other` |
| `e_number` | string | E-number if applicable (e.g., "E330") |
| `source_ingredient` | string | Which ingredient in the tree this was detected from |

---

## 5. Source and Provenance

### Source Object

| Field | Type | Description |
|-------|------|-------------|
| `type` | enum | One of: `usda_fdc`, `open_food_facts`, `manufacturer_api`, `manufacturer_page`, `retailer_catalog`, `ocr_label`, `manual_entry` |
| `url` | string | Source URL (if applicable) |
| `retrieved_at` | ISO 8601 | When the data was retrieved |
| `fdc_id` | string | USDA FoodData Central ID (if applicable) |

### Field-Level Provenance

Any field in the record can carry an override in `field_provenance`:

```json
{
  "field_provenance": {
    "calories": {
      "source_type": "manufacturer_page",
      "confidence": "high",
      "retrieved_at": "2026-03-01T12:00:00Z"
    },
    "ingredients_structured": {
      "source_type": "ocr_label",
      "confidence": "medium",
      "retrieved_at": "2026-02-15T09:30:00Z",
      "notes": "Parsed from product photo; manual review recommended"
    }
  }
}
```

### Confidence Levels

| Level | Meaning |
|-------|---------|
| `high` | From an official API or verified manufacturer source |
| `medium` | Parsed or transformed from structured text |
| `low` | Inferred, OCR'd, or from an unverified community source |

---

## 6. Serving Conversions

To power the portion calculator, each product can include conversion factors.

### ServingConversion Object

| Field | Type | Description |
|-------|------|-------------|
| `unit` | string | Unit name (e.g., "cup", "piece", "tablespoon", "slice") |
| `grams` | number | Weight in grams for one of this unit |
| `source` | enum | Where this conversion came from |

### Example

```json
{
  "serving_conversions": [
    { "unit": "cup", "grams": 30, "source": "manufacturer_page" },
    { "unit": "piece", "grams": 8, "source": "usda_fdc" }
  ]
}
```

This allows the portion calculator to accept input like "1.5 cups" or "3 pieces" and compute accurate nutrition values.

---

## 7. Full Record Example

```json
{
  "food_id": "0016000275287",
  "product_name": "Honey Nut Cheerios",
  "brand": "Cheerios",
  "manufacturer": "General Mills",
  "category": "cereal",
  "barcode_type": "upc_a",
  "serving_size": { "value": 39, "unit": "g" },
  "serving_size_description": "About 1 1/2 cups",
  "servings_per_container": 9,
  "nutrition_per_serving": {
    "calories": 140,
    "total_fat": 2,
    "saturated_fat": 0,
    "trans_fat": 0,
    "cholesterol": 0,
    "sodium": 190,
    "total_carbohydrate": 30,
    "dietary_fiber": 3,
    "total_sugars": 12,
    "added_sugars": 12,
    "protein": 3,
    "vitamin_d": 2,
    "calcium": 130,
    "iron": 9,
    "potassium": 200
  },
  "nutrition_per_100g": {
    "calories": 359,
    "total_fat": 5.1,
    "saturated_fat": 0,
    "trans_fat": 0,
    "cholesterol": 0,
    "sodium": 487,
    "total_carbohydrate": 76.9,
    "dietary_fiber": 7.7,
    "total_sugars": 30.8,
    "added_sugars": 30.8,
    "protein": 7.7,
    "vitamin_d": 5.1,
    "calcium": 333,
    "iron": 23.1,
    "potassium": 513
  },
  "ingredients_raw": "Whole grain oats, sugar, oat bran, modified corn starch, honey, brown sugar syrup, salt, tripotassium phosphate, canola oil, natural almond flavor, vitamin E (mixed tocopherols) added to preserve freshness",
  "ingredients_structured": [
    { "name": "whole grain oats" },
    { "name": "sugar" },
    { "name": "oat bran" },
    { "name": "modified corn starch" },
    { "name": "honey" },
    { "name": "brown sugar syrup" },
    { "name": "salt" },
    { "name": "tripotassium phosphate" },
    { "name": "canola oil" },
    { "name": "natural almond flavor" },
    {
      "name": "vitamin e",
      "children": [
        { "name": "mixed tocopherols" }
      ]
    }
  ],
  "allergens": ["wheat", "almond"],
  "additives": [
    {
      "name": "tripotassium phosphate",
      "category": "stabilizer",
      "source_ingredient": "tripotassium phosphate"
    },
    {
      "name": "mixed tocopherols",
      "category": "antioxidant",
      "e_number": "E306",
      "source_ingredient": "vitamin e"
    }
  ],
  "serving_conversions": [
    { "unit": "cup", "grams": 26, "source": "manufacturer_page" }
  ],
  "source": {
    "type": "manufacturer_page",
    "url": "https://www.cheerios.com/products/honey-nut-cheerios",
    "retrieved_at": "2026-03-01T12:00:00Z"
  },
  "created_at": "2026-03-01T12:00:00Z",
  "updated_at": "2026-03-01T12:00:00Z"
}
```

---

## 8. Relationship to Existing Standards

| Standard | Relationship |
|----------|-------------|
| USDA FoodData Central | Primary reference for base nutrition data; `fdc_id` links records |
| GS1 Digital Link | Target identifier format for 2D barcode integration |
| Open Food Facts | Supplementary data source; not authoritative |
| FDA Nutrition Facts | Defines required label fields that map to `NutritionFacts` |
| JSON Schema | Record validation format (to be published separately) |
