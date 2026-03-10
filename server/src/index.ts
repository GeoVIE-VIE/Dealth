import express from "express";
import cors from "cors";
import path from "path";
import { initDb } from "./db/schema";
import productRoutes from "./routes/products";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/products", productRoutes);

// Serve static frontend in production
const clientBuild = path.join(__dirname, "../../client/dist");
app.use(express.static(clientBuild));
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientBuild, "index.html"));
});

// Initialize database and start server
initDb();
console.log("Database initialized");

app.listen(PORT, () => {
  console.log(`Dealth server running on http://localhost:${PORT}`);
});

export default app;
