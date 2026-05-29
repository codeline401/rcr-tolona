// src/app.ts
// Configuration principale de l'application Express.
// On y branche tous les middlewares globaux et toutes les routes.

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import router from "./routes";

const app = express();

// --- Sécurité : helmet ajoute des headers HTTP de protection ---
app.use(helmet());

// --- CORS : autorise le frontend à appeler l'API ---
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, // autorise les cookies / Authorization header
  }),
);

// --- Logs des requêtes en mode développement ---
app.use(morgan("dev"));

// --- Parseurs : permet de lire le JSON dans req.body ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Fichiers uploadés : accessibles via /uploads/... ---
// Ex: http://localhost:8000/uploads/membres/photo.jpg
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// --- Toutes les routes de l'API ---
app.use("/api", router);

// --- Route de santé : pour vérifier que le serveur tourne ---
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Gestion des routes inexistantes ---
app.use((_req, res) => {
  res.status(404).json({ message: "Route introuvable" });
});

export default app;
