// src/modules/cotisation/cotisation.routes.ts
// Toutes les routes du module cotisation.
// Lecture : tous les utilisateurs connectés
// Écriture : staff uniquement

import { Router } from "express";
import { authenticate, isStaff } from "../../middlewares/auth.middleware";
import * as ctrl from "./cotisation.controller";
import {
  createCampagneValidation,
  createTypeCotisationValidation,
  createCotisationValidation,
  createPaiementValidation,
  listCotisationValidation,
} from "./cotisation.validation";

const router = Router();

// Toutes les routes nécessitent d'être connecté
router.use(authenticate);

// --- Stats globales ---
// GET /api/cotisations/stats?campagneId=xxx
router.get("/stats", ctrl.getStats);

// ----------------------------------------------------------------
// CAMPAGNES  →  /api/cotisations/campagnes
// ----------------------------------------------------------------
router.get("/campagnes", ctrl.getCampagnes);
router.get("/campagnes/:id", ctrl.getCampagneById);
router.post(
  "/campagnes",
  isStaff,
  createCampagneValidation,
  ctrl.createCampagne,
);
router.patch("/campagnes/:id", isStaff, ctrl.updateCampagne);
router.delete("/campagnes/:id", isStaff, ctrl.deleteCampagne);

// ----------------------------------------------------------------
// TYPES DE COTISATION  →  /api/cotisations/types
// ----------------------------------------------------------------
router.get("/types", ctrl.getTypesCotisation);
router.post(
  "/types",
  isStaff,
  createTypeCotisationValidation,
  ctrl.createTypeCotisation,
);
router.patch("/types/:id", isStaff, ctrl.updateTypeCotisation);

// ----------------------------------------------------------------
// COTISATIONS  →  /api/cotisations
// ----------------------------------------------------------------
router.get("/", listCotisationValidation, ctrl.getCotisations);
router.post("/", isStaff, createCotisationValidation, ctrl.createCotisation);
router.get("/:id", ctrl.getCotisationById);
router.delete("/:id", isStaff, ctrl.deleteCotisation);

// ----------------------------------------------------------------
// PAIEMENTS  →  /api/cotisations/:cotisationId/paiements
// ----------------------------------------------------------------
router.post(
  "/:cotisationId/paiements",
  isStaff,
  createPaiementValidation,
  ctrl.createPaiement,
);
router.patch(
  "/paiements/:paiementId/invalider",
  isStaff,
  ctrl.invaliderPaiement,
);

export default router;
