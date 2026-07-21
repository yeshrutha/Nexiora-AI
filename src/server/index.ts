import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeRouter } from "./routes/analyze.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// API Endpoints
app.use("/api", analyzeRouter);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "Nexiora AI Backend",
    engine: "Insight Analysis Engine",
    timestamp: new Date().toISOString(),
  });
});

// Serve Vite production build static assets from dist/
const clientDistPath = path.join(__dirname, "..");
app.use(express.static(clientDistPath));

// SPA Fallback middleware compatible with Express 5
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    res.status(404).json({ error: `API endpoint ${req.method} ${req.path} not found.` });
    return;
  }
  res.sendFile(path.join(clientDistPath, "index.html"), (err) => {
    if (err) {
      res.status(200).send("Nexiora AI API Server is active.");
    }
  });
});

app.listen(PORT, () => {
  console.log(`[Nexiora AI] Server running on http://localhost:${PORT}`);
});
