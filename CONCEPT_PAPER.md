# Dealth: A National QR-Based Digital Nutrition System

## Concept Paper

---

## 1. The Problem

The way Americans access and understand food nutrition information is fundamentally broken. Despite decades of nutrition labeling requirements, four critical problems persist:

### Confusing Serving Sizes

FDA-mandated Nutrition Facts labels use standardized serving sizes based on amounts people actually consume. Yet consumers routinely misinterpret them. A bag of chips may list 140 calories per serving, but contain 8 servings. A bottle of soda may appear to be a single serving but contain 2.5. The gap between what the label says and what people actually eat is a persistent source of dietary miscalculation.

### Hidden Ingredient Complexity

Ingredient lists on packaged foods are dense, flat text strings that obscure the true composition of products. A single ingredient like "chocolate chips" may itself contain sugar, cocoa butter, soy lecithin, and artificial flavoring. Consumers with allergies, dietary restrictions, or health conditions cannot efficiently parse these nested structures. There is no widely available system that breaks ingredient lists into searchable, structured hierarchies.

### Lack of Machine-Readable Food Data

While the USDA maintains FoodData Central with standardized nutrition composition data, and the FDA defines label requirements, there is no unified, machine-readable system that links every packaged food product to its full nutrition profile via a scannable identifier. Product data is fragmented across manufacturer websites, retailer catalogs, community databases, and physical labels. No standard connects a barcode scan to a complete, structured, authoritative nutrition record.

### Difficulty Tracking Real Nutrition Intake

Existing diet-tracking apps require manual entry, rely on incomplete databases, and struggle with portion accuracy. The fundamental issue is that there is no infrastructure layer connecting the food a person holds in their hand to a machine-readable data record that can power accurate, automatic nutrition calculations.

---

## 2. The Solution

**Dealth** proposes a national QR-based digital nutrition system where every packaged food product links to a machine-readable database containing:

- Complete nutrition facts (per serving and per 100g)
- Structured ingredient hierarchies (not just flat text)
- Allergen and additive classifications
- Portion calculation tools that adapt to what the user actually eats

The system is anchored to universal product identifiers (GTIN/UPC) and, over time, GS1 Digital Link / 2D barcodes. This means every scannable code on a food package becomes a gateway to a rich, structured, auditable nutrition record.

### How It Differs from Existing Solutions

| Existing Approach | Dealth Approach |
|-------------------|-----------------|
| Flat ingredient text on labels | Structured ingredient tree with nesting |
| Static serving sizes on packaging | Dynamic portion calculator based on user input |
| Fragmented data across sources | Unified schema with provenance tracking |
| Manual diet-tracking entry | Scan-to-calculate workflow |
| No confidence metadata | Every field carries source, timestamp, and confidence |

---

## 3. What the System Does

### Core Capabilities

1. **Scan Food** — User scans a QR code or barcode on any packaged food product. The system resolves the product identifier (GTIN/UPC) to a structured data record.

2. **Input Portion** — User specifies how much they actually ate or plan to eat, using intuitive units (e.g., "half the bag," "2 cups," "150 grams").

3. **Calculate Intake** — The system computes precise nutrition values for the user's actual portion, including calories, macronutrients, sodium, sugar, and fiber.

4. **Detect Allergens** — The structured ingredient tree flags known allergens (milk, soy, wheat, peanuts, tree nuts, eggs, fish, shellfish, sesame) automatically.

5. **Analyze Additives** — Ingredients are mapped to a controlled vocabulary that classifies additives (preservatives, colorings, emulsifiers, sweeteners) and supports "ultra-processed" heuristic scoring.

### User Flow

```
Scan QR / barcode on package
       ↓
Product page opens with full nutrition data
       ↓
User enters portion actually eaten
       ↓
Nutrition automatically calculated for that portion
       ↓
Allergens and additives flagged
       ↓
Data saved to personal intake log (optional)
```

### Data Architecture

The system is built on a multi-tier data ingestion pipeline:

- **Tier 1:** Official APIs and datasets (USDA FoodData Central)
- **Tier 2:** Manufacturer product pages and feeds
- **Tier 3:** Retailer structured data and catalog feeds
- **Tier 4:** Community and open databases (Open Food Facts)
- **Tier 5:** OCR and scraping from package images (fallback only)

Every data point carries provenance metadata: source, timestamp, acquisition method, and confidence score.

---

## 4. Why It Helps Public Health

### Better Diet Tracking

By connecting physical food products to machine-readable data via a simple scan, the system removes the friction that makes diet tracking inaccurate. Users no longer need to search databases, guess portion sizes, or manually enter values. The result is higher-fidelity dietary data at both the individual and population level.

### Diabetes Management

For the 37 million Americans with diabetes and the 96 million with prediabetes, accurate carbohydrate counting is a daily medical necessity. The portion calculator and structured nutrition data enable precise carb tracking tied to actual consumption, not label approximations. The application layer can compute net carbs (total carbs minus fiber) and flag high-glycemic ingredients.

### Obesity Reduction

Portion confusion is a well-documented contributor to overconsumption. When people can scan a product and instantly see the nutrition impact of the amount they actually eat, they make better-informed choices. Population-wide access to this tool could meaningfully shift consumption patterns.

### Improved Research Data

Nutrition researchers currently rely on self-reported dietary recalls, which are notoriously unreliable. A scan-based system generates structured, timestamped dietary data that could transform epidemiological research. With proper consent and anonymization, aggregated intake data could reveal patterns invisible to current methodologies.

### Additive and Allergen Transparency

The structured ingredient parser enables a level of food transparency that flat text labels cannot provide. Consumers can filter by diet (vegan, keto, low-FODMAP), flag specific additives they want to avoid, and receive automatic allergen warnings based on the full ingredient tree, including sub-ingredients.

---

## 5. Implementation Path

### Immediate Next Step

Write this concept paper. It serves as:

- A **blueprint** for the system's technical and policy architecture
- A **communication tool** to show potential collaborators, funders, and partners
- The **basis for research proposals** or grant applications

### Near-Term (Months 1-3)

- Define the data standard for structured food records
- Build a prototype: QR scan to nutrition calculator for 100 packaged foods
- Use USDA FoodData Central, Open Food Facts, and selective manufacturer scraping

### Medium-Term (Months 3-12)

- Share the concept and demo with health researchers, nutritionists, and public health groups
- Engage organizations like the CDC and NIH that explore nutrition tracking innovation
- Build a coalition of doctors, diabetes associations, nutrition researchers, and food transparency advocates

### Long-Term (Year 1+)

- Develop the idea into a policy proposal for the FDA and USDA
- Advocate for standardized machine-readable nutrition data requirements
- Scale the database to cover the majority of U.S. packaged food products

---

## 6. Legal and Ethical Foundations

- **Data sourcing** prioritizes public-domain and licensed APIs (USDA data is CC0)
- **Web scraping** respects robots.txt and terms of service; used only as a fallback
- **Provenance tracking** ensures every data point is auditable and reproducible
- **User privacy** is a core design principle; personal intake data stays under user control
- **Open standards** are preferred to prevent vendor lock-in and enable ecosystem growth

---

## Summary

Dealth addresses a gap in America's food information infrastructure. The nutrition data exists, but it is fragmented, unstructured, and disconnected from the physical products people buy. By linking every packaged food to a machine-readable, structured, auditable nutrition record via universal product identifiers, the system enables accurate portion-based nutrition tracking, allergen detection, additive analysis, and public health research at scale.

The first step is this document. The next step is a working prototype.
