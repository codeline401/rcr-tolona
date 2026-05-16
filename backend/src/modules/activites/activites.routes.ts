// src/modules/activites/activites.routes.ts
//
// Routes PUBLIQUES :
//   GET /api/activites/public          → liste activités publiques
//   GET /api/activites/:id/public      → détail activité publique
//
// Routes PRIVÉES (auth) :
//   GET /api/activites                 → toutes les activités (staff)
//   GET /api/activites/stats           → statistiques
//   GET /api/activites/:id             → détail avec stats
//   POST /api/activites                → créer (staff)
//   PATCH /api/activites/:id           → modifier (staff)
//   DELETE /api/activites/:id          → supprimer (staff)
//   PATCH /api/activites/:id/terminer  → marquer terminée (staff)
//   PATCH /api/activites/:id/annuler   → annuler (staff)
//
//   GET/POST  /api/activites/:id/etapes         → étapes
//   PATCH/DEL /api/activites/etapes/:etapeId    → étape spécifique
//
//   GET/POST  /api/activites/:id/budget         → postes budgétaires
//   PATCH/DEL /api/activites/budget/:posteId    → poste spécifique
//
//   GET/POST  /api/activites/:id/contributions  → contributions
//   PATCH     /api/activites/contributions/:id/statut → valider/annuler

import { Router } from "express";
import { authenticate, isStaff } from "../../middlewares/auth.middleware";
import { uploadIllustration } from "../../middlewares/upload.middleware";
import * as ctrl from "./activites.controller";
import {
  createActiviteValidation,
  updateActiviteValidation,
  createEtapeValidation,
  createPosteBudgetValidation,
  createContributionValidation,
  validerContributionValidation,
  listActiviteValidation,
} from "./activites.validation";

const router = Router();

// ----------------------------------------------------------------
// Routes PUBLIQUES
// ----------------------------------------------------------------
router.get("/public", ctrl.getActivitesPubliques);
router.get("/:id/public", ctrl.getActivitePubliqueById);

// ----------------------------------------------------------------
// Routes PRIVÉES — authentification requise
// ----------------------------------------------------------------
router.use(authenticate);

// Stats (avant /:id pour éviter le conflit de route)
router.get("/stats", ctrl.getStats);

// CRUD activités (staff uniquement pour les mutations)
router.get("/", listActiviteValidation, ctrl.getActivites);
router.get("/:id", ctrl.getActiviteById);
router.post(
  "/",
  isStaff,
  uploadIllustration,
  createActiviteValidation,
  ctrl.createActivite,
);
router.patch(
  "/:id",
  isStaff,
  uploadIllustration,
  updateActiviteValidation,
  ctrl.updateActivite,
);
router.delete("/:id", isStaff, ctrl.deleteActivite);

// Actions de statut
router.patch("/:id/terminer", isStaff, ctrl.terminerActivite);
router.patch("/:id/annuler", isStaff, ctrl.annulerActivite);

// ----------------------------------------------------------------
// ÉTAPES
// ----------------------------------------------------------------
router.get("/:id/etapes", ctrl.getEtapes);
router.post("/:id/etapes", isStaff, createEtapeValidation, ctrl.createEtape);
router.patch("/etapes/:etapeId", isStaff, ctrl.updateEtape);
router.delete("/etapes/:etapeId", isStaff, ctrl.deleteEtape);

// ----------------------------------------------------------------
// POSTES BUDGÉTAIRES
// ----------------------------------------------------------------
router.get("/:id/budget", isStaff, ctrl.getPostesBudget);
router.post(
  "/:id/budget",
  isStaff,
  createPosteBudgetValidation,
  ctrl.createPosteBudget,
);
router.patch("/budget/:posteId", isStaff, ctrl.updatePosteBudget);
router.delete("/budget/:posteId", isStaff, ctrl.deletePosteBudget);

// ----------------------------------------------------------------
// CONTRIBUTIONS
// ----------------------------------------------------------------
router.get("/:id/contributions", ctrl.getContributions);
router.post(
  "/:id/contributions",
  createContributionValidation,
  ctrl.createContribution,
);
router.patch(
  "/contributions/:contributionId/statut",
  isStaff,
  validerContributionValidation,
  ctrl.updateStatutContribution,
);

export default router;
