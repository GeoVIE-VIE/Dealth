import { useState } from "react";
import ProductSearch from "./components/ProductSearch";
import ProductDetail from "./components/ProductDetail";
import BarcodeScanner from "./components/BarcodeScanner";
import type { Product } from "./services/api";
import "./App.css";

type View = "search" | "detail" | "scan";

export default function App() {
  const [view, setView] = useState<View>("search");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleSelect = (product: Product) => {
    setSelectedProduct(product);
    setView("detail");
  };

  const handleBack = () => {
    setView("search");
    setSelectedProduct(null);
  };

  const handleScanResult = (product: Product) => {
    setSelectedProduct(product);
    setView("detail");
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 onClick={handleBack} style={{ cursor: "pointer" }}>
          Dealth
        </h1>
        <p className="subtitle">Digital Nutrition System</p>
        <nav className="nav-tabs">
          <button
            className={view === "search" ? "active" : ""}
            onClick={handleBack}
          >
            Search
          </button>
          <button
            className={view === "scan" ? "active" : ""}
            onClick={() => setView("scan")}
          >
            Scan Barcode
          </button>
        </nav>
      </header>

      <main className="app-main">
        {view === "search" && <ProductSearch onSelect={handleSelect} />}
        {view === "detail" && selectedProduct && (
          <ProductDetail product={selectedProduct} onBack={handleBack} />
        )}
        {view === "scan" && (
          <BarcodeScanner onResult={handleScanResult} onBack={handleBack} />
        )}
      </main>

      <footer className="app-footer">
        <p>Dealth — Phase 3 Prototype</p>
      </footer>
    </div>
  );
}
