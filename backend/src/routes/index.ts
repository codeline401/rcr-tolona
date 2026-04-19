// src/routes/index.ts
// Centralise toutes les routes de l'API.
// Chaque module a son propre fichier de routes.

import { Router } from "express";

// On importera les routes au fur et à mesure qu'on les crée.
// Pour l'instant on les déclare en commentaire et on les activera une par une.

import authRoutes from "../modules/auth/auth.routes";
import madaRoutes from "../modules/mada/mada.routes";
// import membreRoutes    from '../modules/membre/membre.routes';
// import cotisRoutes     from '../modules/cotisation/cotisation.routes';
// import financeRoutes   from '../modules/finance/finance.routes';
// import blogRoutes      from '../modules/blog/blog.routes';
// import votingRoutes    from '../modules/voting/voting.routes';
// import activitesRoutes from '../modules/activites/activites.routes';

const router = Router();

router.use("/auth", authRoutes);
router.use("/mada", madaRoutes);
// router.use('/membres',     membreRoutes);
// router.use('/cotisations', cotisRoutes);
// router.use('/finance',     financeRoutes);
// router.use('/blog',        blogRoutes);
// router.use('/voting',      votingRoutes);
// router.use('/activites',   activitesRoutes);

// Route de test pour confirmer que le routeur fonctionne
router.get("/", (_req, res) => {
  res.json({ message: "API RCR opérationnelle 🚀" });
});

export default router;
