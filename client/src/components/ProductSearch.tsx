import { useState, useEffect } from "react";
import { fetchProducts, Product } from "../services/api";

interface Props {
  onSelect: (product: Product) => void;
}

export default function ProductSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      fetchProducts(query || undefined)
        .then(setProducts)
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="search-container">
      <input
        className="search-input"
        type="text"
        placeholder="Search products by name, brand, or UPC..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="loading">No products found.</div>
      ) : (
        <div className="product-list">
          {products.map((p) => (
            <div
              key={p.food_id}
              className="product-card"
              onClick={() => onSelect(p)}
            >
              <div className="product-card-info">
                <h3>{p.product_name}</h3>
                <span className="brand">
                  {p.brand}
                  {p.category && ` · ${p.category}`}
                </span>
              </div>
              <div className="product-card-cal">
                <div className="cal-num">
                  {p.nutrition_per_serving?.calories ?? "—"}
                </div>
                <div className="cal-label">cal/serving</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
