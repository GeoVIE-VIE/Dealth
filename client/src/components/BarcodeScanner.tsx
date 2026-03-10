import { useState } from "react";
import { fetchProduct, Product } from "../services/api";

interface Props {
  onResult: (product: Product) => void;
  onBack: () => void;
}

export default function BarcodeScanner({ onResult, onBack }: Props) {
  const [barcode, setBarcode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    if (!barcode.trim()) return;
    setError("");
    setLoading(true);
    try {
      const product = await fetchProduct(barcode.trim());
      onResult(product);
    } catch {
      setError(
        `No product found for barcode "${barcode}". Try one of the seeded UPCs.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLookup();
  };

  // Sample UPCs for the demo
  const sampleUPCs = [
    { code: "0016000275287", name: "Honey Nut Cheerios" },
    { code: "0028400090971", name: "Doritos Nacho Cheese" },
    { code: "0049000006582", name: "Coca-Cola Classic" },
    { code: "0044000032197", name: "Oreo Cookies" },
    { code: "0012000001086", name: "Lay's Classic" },
  ];

  return (
    <div className="scanner-container">
      <button className="back-btn" onClick={onBack}>
        &larr; Back
      </button>

      <h2 style={{ marginBottom: "0.5rem" }}>Barcode Lookup</h2>
      <p className="scanner-hint">
        Enter a UPC/GTIN barcode to look up a product. In a production system,
        this would use the device camera for QR/barcode scanning.
      </p>

      <div className="scanner-input-group">
        <input
          type="text"
          placeholder="Enter UPC barcode (e.g., 0016000275287)"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <button onClick={handleLookup} disabled={loading}>
          {loading ? "..." : "Look Up"}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="section" style={{ marginTop: "1.5rem" }}>
        <h3>Sample Barcodes (Demo)</h3>
        <div className="product-list">
          {sampleUPCs.map((s) => (
            <div
              key={s.code}
              className="product-card"
              onClick={() => {
                setBarcode(s.code);
                setError("");
                setLoading(true);
                fetchProduct(s.code)
                  .then(onResult)
                  .catch(() =>
                    setError(`Could not load ${s.name}`)
                  )
                  .finally(() => setLoading(false));
              }}
            >
              <div className="product-card-info">
                <h3>{s.name}</h3>
                <span className="brand" style={{ fontFamily: "monospace" }}>
                  {s.code}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
