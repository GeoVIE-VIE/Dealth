import { IngredientNode } from "../models/types";

/**
 * Parses a flat FDA-style ingredient string into a structured tree.
 *
 * Handles:
 * - Comma-separated ingredients at top level
 * - Parenthetical sub-ingredients: "chocolate chips (sugar, cocoa butter)"
 * - Nested parentheticals: "flour (wheat flour (enriched), malted barley flour)"
 * - Period-terminated lists
 */
export function parseIngredients(raw: string): IngredientNode[] {
  const cleaned = raw.replace(/\.$/, "").trim();
  if (!cleaned) return [];
  return parseLevel(cleaned);
}

function parseLevel(text: string): IngredientNode[] {
  const nodes: IngredientNode[] = [];
  const tokens = splitTopLevel(text);

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    const parenStart = findTopLevelParen(trimmed);

    if (parenStart !== -1) {
      const name = trimmed.slice(0, parenStart).trim();
      const parenContent = extractParenContent(trimmed, parenStart);
      const node: IngredientNode = {
        name: normalizeName(name),
        name_raw: name,
      };
      if (parenContent) {
        node.children = parseLevel(parenContent);
      }
      nodes.push(node);
    } else {
      nodes.push({
        name: normalizeName(trimmed),
        name_raw: trimmed,
      });
    }
  }

  return nodes;
}

/** Split on commas, but only at the top level (not inside parentheses). */
function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(" || text[i] === "[") depth++;
    else if (text[i] === ")" || text[i] === "]") depth--;
    else if (text[i] === "," && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

/** Find the index of the first top-level opening parenthesis. */
function findTopLevelParen(text: string): number {
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(" || text[i] === "[") return i;
  }
  return -1;
}

/** Extract content between matched parentheses starting at `start`. */
function extractParenContent(text: string, start: number): string {
  const open = text[start];
  const close = open === "(" ? ")" : "]";
  let depth = 0;

  for (let i = start; i < text.length; i++) {
    if (text[i] === open) depth++;
    else if (text[i] === close) {
      depth--;
      if (depth === 0) {
        return text.slice(start + 1, i).trim();
      }
    }
  }
  // Unbalanced — take everything after the open paren
  return text.slice(start + 1).trim();
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[*†‡]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Known allergen keywords for auto-detection
const ALLERGEN_KEYWORDS: Record<string, string> = {
  wheat: "wheat",
  "wheat flour": "wheat",
  gluten: "wheat",
  milk: "milk",
  cream: "milk",
  butter: "milk",
  cheese: "milk",
  whey: "milk",
  casein: "milk",
  lactose: "milk",
  soy: "soy",
  "soy lecithin": "soy",
  soybean: "soy",
  peanut: "peanut",
  peanuts: "peanut",
  "tree nut": "tree nuts",
  almond: "tree nuts",
  almonds: "tree nuts",
  walnut: "tree nuts",
  walnuts: "tree nuts",
  cashew: "tree nuts",
  cashews: "tree nuts",
  pecan: "tree nuts",
  pecans: "tree nuts",
  egg: "eggs",
  eggs: "eggs",
  fish: "fish",
  shellfish: "shellfish",
  shrimp: "shellfish",
  crab: "shellfish",
  lobster: "shellfish",
  sesame: "sesame",
  "sesame seeds": "sesame",
};

/** Detect allergens from a parsed ingredient tree. */
export function detectAllergens(nodes: IngredientNode[]): string[] {
  const found = new Set<string>();

  function walk(list: IngredientNode[]) {
    for (const node of list) {
      const lower = node.name.toLowerCase();
      // Check exact match and partial matches
      for (const [keyword, allergen] of Object.entries(ALLERGEN_KEYWORDS)) {
        if (lower === keyword || lower.includes(keyword)) {
          found.add(allergen);
        }
      }
      if (node.children) walk(node.children);
    }
  }

  walk(nodes);
  return Array.from(found).sort();
}

// Known additive classifications
const ADDITIVE_MAP: Record<
  string,
  { category: string; e_number?: string }
> = {
  "soy lecithin": { category: "emulsifier", e_number: "E322" },
  lecithin: { category: "emulsifier", e_number: "E322" },
  "mixed tocopherols": { category: "antioxidant", e_number: "E306" },
  "tocopherols": { category: "antioxidant", e_number: "E306" },
  "citric acid": { category: "antioxidant", e_number: "E330" },
  "ascorbic acid": { category: "antioxidant", e_number: "E300" },
  "sodium benzoate": { category: "preservative", e_number: "E211" },
  "potassium sorbate": { category: "preservative", e_number: "E202" },
  "calcium propionate": { category: "preservative", e_number: "E282" },
  "sodium nitrite": { category: "preservative", e_number: "E250" },
  "carrageenan": { category: "stabilizer", e_number: "E407" },
  "xanthan gum": { category: "stabilizer", e_number: "E415" },
  "guar gum": { category: "stabilizer", e_number: "E412" },
  "cellulose gum": { category: "stabilizer", e_number: "E466" },
  "mono and diglycerides": { category: "emulsifier", e_number: "E471" },
  "polysorbate 80": { category: "emulsifier", e_number: "E433" },
  "tripotassium phosphate": { category: "stabilizer" },
  "sodium phosphate": { category: "stabilizer" },
  "red 40": { category: "coloring" },
  "yellow 5": { category: "coloring" },
  "yellow 6": { category: "coloring" },
  "blue 1": { category: "coloring" },
  "caramel color": { category: "coloring", e_number: "E150" },
  sucralose: { category: "sweetener", e_number: "E955" },
  aspartame: { category: "sweetener", e_number: "E951" },
  "acesulfame potassium": { category: "sweetener", e_number: "E950" },
  "monosodium glutamate": { category: "flavor_enhancer", e_number: "E621" },
  msg: { category: "flavor_enhancer", e_number: "E621" },
};

/** Detect additives from a parsed ingredient tree. */
export function detectAdditives(
  nodes: IngredientNode[]
): Array<{ name: string; category: string; e_number?: string; source_ingredient: string }> {
  const found: Array<{
    name: string;
    category: string;
    e_number?: string;
    source_ingredient: string;
  }> = [];
  const seen = new Set<string>();

  function walk(list: IngredientNode[], parentName?: string) {
    for (const node of list) {
      const lower = node.name.toLowerCase();
      for (const [keyword, info] of Object.entries(ADDITIVE_MAP)) {
        if (lower === keyword || lower.includes(keyword)) {
          if (!seen.has(keyword)) {
            seen.add(keyword);
            found.push({
              name: keyword,
              category: info.category,
              e_number: info.e_number,
              source_ingredient: parentName || node.name,
            });
          }
        }
      }
      if (node.children) walk(node.children, node.name);
    }
  }

  walk(nodes);
  return found;
}
