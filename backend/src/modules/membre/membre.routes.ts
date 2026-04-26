// src/modules/membre/membre.routes.ts
// Toutes les routes du modules membres
// Toutes nécessitent d'être connecté (auth middleware)
// les actions de modification nécessitent d'être staff (isStaff)

import { Router } from "express";
import { authenticate, isStaff } from "../../middlewares/auth.middleware";
import { uploadMember } from "../../middlewares/upload.middleware";
import * as membreController from "./membre.controller";
import {
  createMemberValidation,
  listMemberValidation,
  updateMemberValidation,
  updateValidityValidation,
} from "./membre.validation";
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

const router = Router(); // Création du routeur Express

// Validation de la raison d'exclusion
const excludeValidation = [
  body("raison")
    .trim()
    .notEmpty()
    .withMessage("La raison d'exclusion est requise.")
    .isLength({ min: 3, max: 500 })
    .withMessage("La raison doit comporter entre 3 et 500 caractères."),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    return next();
  },
];

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
  uploadMember,
  createMemberValidation,
  membreController.createMembre,
);

// --- Actions spéciales sur un membre (avant /:id pour éviter tous conflits) ---
// PATCH /api/membres/:id/validity  -> valider / rejeter
// PATCH /api/membres/:id/exclude   -> exclure
router.patch(
  "/:id/validity",
  isStaff,
  updateValidityValidation,
  membreController.updateValidityStatus,
);
router.patch(
  "/:id/exclude",
  isStaff,
  excludeValidation,
  membreController.excludeMembre,
);

// --- CRUD standard ---
// GET /api/membres/:id       -> fiche détaillée
// PATCH /api/membres/:id     -> modifier un membre (avec photo optionnelle)
// DELETE /api/membres/:id    -> supprimer un membre
router.get("/:id", membreController.getMembreById);
router.patch(
  "/:id",
  isStaff,
  uploadMember,
  updateMemberValidation,
  membreController.updateMembre,
);
router.delete("/:id", isStaff, membreController.deleteMembre);

export default router; // Export du routeur pour l'utiliser dans app.ts
