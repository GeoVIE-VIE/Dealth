import { Router, Request, Response } from "express";
import {
  getAllProducts,
  getProductById,
  searchProducts,
} from "../services/productService";
import { calculatePortion, PortionInput } from "../services/portionCalculator";

const router = Router();

// GET /api/products — list all or search
router.get("/", (req: Request<{}, {}, {}, { q?: string }>, res: Response) => {
  const query = req.query.q;
  const products = query ? searchProducts(query) : getAllProducts();
  res.json(products);
});

// GET /api/products/:id — get by food_id (UPC/GTIN)
router.get("/:id", (req: Request<{ id: string }>, res: Response) => {
  const product = getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(product);
});

// POST /api/products/:id/portion — calculate nutrition for a portion
router.post("/:id/portion", (req: Request<{ id: string }>, res: Response) => {
  const product = getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const { amount, unit } = req.body as PortionInput;
  if (!amount || !unit) {
    res.status(400).json({ error: "amount and unit are required" });
    return;
  }

  const result = calculatePortion(
    { amount: Number(amount), unit },
    product.serving_size.value,
    product.nutrition_per_serving,
    product.serving_conversions
  );

  res.json({
    product: {
      food_id: product.food_id,
      product_name: product.product_name,
      brand: product.brand,
    },
    portion: result,
  });
});

export default router;
