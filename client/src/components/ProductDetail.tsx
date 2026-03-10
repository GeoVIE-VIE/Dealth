import { useState } from "react";
import {
  Product,
  NutritionFacts,
  IngredientNode,
  calculatePortion,
  PortionResult,
} from "../services/api";

interface Props {
  product: Product;
  onBack: () => void;
}

const NUTRIENT_ROWS: Array<{
  key: keyof NutritionFacts;
  label: string;
  unit: string;
  major?: boolean;
  sub?: boolean;
}> = [
  { key: "calories", label: "Calories", unit: "kcal", major: true },
  { key: "total_fat", label: "Total Fat", unit: "g", major: true },
  { key: "saturated_fat", label: "Saturated Fat", unit: "g", sub: true },
  { key: "trans_fat", label: "Trans Fat", unit: "g", sub: true },
  { key: "cholesterol", label: "Cholesterol", unit: "mg" },
  { key: "sodium", label: "Sodium", unit: "mg" },
  {
    key: "total_carbohydrate",
    label: "Total Carbohydrate",
    unit: "g",
    major: true,
  },
  { key: "dietary_fiber", label: "Dietary Fiber", unit: "g", sub: true },
  { key: "total_sugars", label: "Total Sugars", unit: "g", sub: true },
  { key: "added_sugars", label: "Added Sugars", unit: "g", sub: true },
  { key: "protein", label: "Protein", unit: "g", major: true },
  { key: "vitamin_d", label: "Vitamin D", unit: "mcg" },
  { key: "calcium", label: "Calcium", unit: "mg" },
  { key: "iron", label: "Iron", unit: "mg" },
  { key: "potassium", label: "Potassium", unit: "mg" },
];

function NutritionTable({ nutrition }: { nutrition: NutritionFacts }) {
  return (
    <table className="nutrition-table">
      <tbody>
        {NUTRIENT_ROWS.map((row) => (
          <tr
            key={row.key}
            className={row.major ? "major" : row.sub ? "sub" : ""}
          >
            <td>{row.label}</td>
            <td>
              {nutrition[row.key] !== null ? `${nutrition[row.key]}${row.unit}` : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function IngredientTree({ nodes }: { nodes: IngredientNode[] }) {
  return (
    <div className="ingredient-tree">
      <ul>
        {nodes.map((node, i) => (
          <li key={i}>
            {node.name}
            {node.children && node.children.length > 0 && (
              <ul>
                {node.children.map((child, j) => (
                  <li key={j}>{child.name}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ProductDetail({ product, onBack }: Props) {
  const [amount, setAmount] = useState(1);
  const [unit, setUnit] = useState("serving");
  const [portionResult, setPortionResult] = useState<PortionResult | null>(
    null
  );
  const [calculating, setCalculating] = useState(false);

  const availableUnits = [
    "serving",
    "g",
    "oz",
    ...product.serving_conversions.map((c) => c.unit),
  ];

  const handleCalculate = async () => {
    setCalculating(true);
    try {
      const result = await calculatePortion(product.food_id, amount, unit);
      setPortionResult(result);
    } catch {
      // ignore
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="detail-container">
      <button className="back-btn" onClick={onBack}>
        &larr; Back to search
      </button>

      <div className="detail-header">
        <h2>{product.product_name}</h2>
        <div className="detail-meta">
          <span>{product.brand}</span>
          {product.category && <span>{product.category}</span>}
          <span>UPC: {product.food_id}</span>
        </div>
        <div className="detail-meta" style={{ marginTop: "0.4rem" }}>
          <span>
            Serving: {product.serving_size.value}
            {product.serving_size.unit}
            {product.serving_size_description &&
              ` (${product.serving_size_description})`}
          </span>
          <span>
            {product.servings_per_container} servings/container
          </span>
        </div>
      </div>

      {/* Portion Calculator */}
      <div className="section">
        <h3>Portion Calculator</h3>
        <div className="portion-form">
          <div className="portion-field">
            <label>Amount</label>
            <input
              type="number"
              min={0}
              step={0.25}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>
          <div className="portion-field">
            <label>Unit</label>
            <select value={unit} onChange={(e) => setUnit(e.target.value)}>
              {availableUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <button
            className="portion-btn"
            onClick={handleCalculate}
            disabled={calculating}
          >
            {calculating ? "..." : "Calculate"}
          </button>
        </div>

        {portionResult && (
          <div className="portion-result">
            <div className="result-summary">
              {portionResult.portion.input.amount}{" "}
              {portionResult.portion.input.unit} ={" "}
              {portionResult.portion.grams}g (
              {portionResult.portion.servings.toFixed(2)} servings)
            </div>
            <div>
              <span className="result-cal">
                {portionResult.portion.nutrition.calories}
              </span>{" "}
              <span className="result-cal-label">calories</span>
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <NutritionTable nutrition={portionResult.portion.nutrition} />
            </div>
          </div>
        )}
      </div>

      {/* Nutrition Per Serving */}
      <div className="section">
        <h3>Nutrition Facts (per serving)</h3>
        <NutritionTable nutrition={product.nutrition_per_serving} />
      </div>

      {/* Allergens */}
      {product.allergens.length > 0 && (
        <div className="section">
          <h3>Allergens</h3>
          <div className="tags">
            {product.allergens.map((a) => (
              <span key={a} className="tag allergen">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additives */}
      {product.additives.length > 0 && (
        <div className="section">
          <h3>Additives</h3>
          <div className="tags">
            {product.additives.map((a, i) => (
              <span key={i} className="tag additive">
                {a.name}
                {a.e_number && ` (${a.e_number})`} — {a.category}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients */}
      <div className="section">
        <h3>Ingredients (structured)</h3>
        <IngredientTree nodes={product.ingredients_structured} />
      </div>

      <div className="section">
        <h3>Ingredients (raw label text)</h3>
        <p style={{ fontSize: "0.85rem", color: "#495057" }}>
          {product.ingredients_raw}
        </p>
      </div>

      {/* Source */}
      <div className="section">
        <h3>Data Source</h3>
        <p style={{ fontSize: "0.85rem", color: "#6c757d" }}>
          Source: {product.source.type}
          {product.source.url && (
            <>
              {" "}
              &middot;{" "}
              <a
                href={product.source.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {product.source.url}
              </a>
            </>
          )}
          {product.source.retrieved_at && (
            <>
              {" "}
              &middot; Retrieved:{" "}
              {new Date(product.source.retrieved_at).toLocaleDateString()}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
