// src/modules/membre/membre.routes.ts
// Toutes les routes du modules membres
// Toutes nécessitent d'être connecté (auth middleware)
// les actions de modification nécessitent d'être staff (isStaff)

import { Router } from "express";
import { authenticate, isStaff } from "../../middlewares/auth.middleware";
import { uploadMmeber } from "../../middlewares/upload.middleware";
import * as membreController from "./membre.controller";
import {
  createMemberValidation,
  listMemberValidation,
  updateMemberValidation,
} from "./membre.validation";

const router = Router(); // Création du routeur Express

// Toutes les routes nécessitent d'être connecté
router.use(authenticate);

// --- Statistiques (avant /:id pour ne pas confondre "stats" avec un id) ---
// GET /api/membres/stats
router.get("/stats", membreController.getStats);

// --- Liste et création ---
// GET /api/membres      -> liste paginée avec filtre
// POST /api/membres     -> créer un membre (avec photo optionnelle)
router.get("/", listMemberValidation, membreController.getMembres);
router.post(
  "/",
  isStaff,
  uploadMmeber,
  createMemberValidation,
  membreController.createMembre,
);

// --- Actions spéciales sur un membre (avant /:id pour éviter tous conflits) ---
// PATCH /api/membres/:id/validity  -> valider / rejeter
// PATCH /api/membre/:id/exclude    -> exclure
router.patch(
  "/:id/validity",
  isStaff,
  updateMemberValidation,
  membreController.updateValidityStatus,
);
router.patch("/:id/exclude", isStaff, membreController.excludeMembre);

// --- CRUD standard ---
// GET /api/membres/:id       -> fiche détaillée
// PATCH /pai/membres/:id     -> modifier un membre (avec photo optionnelle)
// DELETE /api/membres/:id    -> supprimer un membre
router.get("/:id", membreController.getMembreById);
router.patch(
  "/:id",
  isStaff,
  uploadMmeber,
  updateMemberValidation,
  membreController.updateMembre,
);
router.delete("/:id", isStaff, membreController.deleteMembre);

export default router; // Export du routeur pour l'utiliser dans app.ts
