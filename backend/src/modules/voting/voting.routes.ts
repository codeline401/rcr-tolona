// src/modules/voting/voting.routes.ts
// Routes du module voting.
//
// Routes PUBLIQUES :
//   GET  /api/voting/elections/public     → élections publiques en cours
//   GET  /api/voting/elections/slug/:slug → détail par slug
//   POST /api/voting/:electionId/vote/token → voter par token anonyme
//
// Routes PRIVÉES (auth) :
//   GET  /api/voting/elections            → toutes les élections
//   POST /api/voting/:electionId/vote     → voter (authentifié)
//   GET  /api/voting/:electionId/statut   → mon statut de vote
//   GET  /api/voting/:electionId/resultats → résultats
//
// Routes STAFF :
//   CRUD élections, choix, tokens, export CSV, config

import { Router } from "express";
import { authenticate, isStaff } from "../../middlewares/auth.middleware";
import * as ctrl from "./voting.controller";
import {
  createElectionValidation,
  updateElectionValidation,
  createChoiceValidation,
  updateChoiceValidation,
  voteValidation,
  voteByTokenValidation,
  generateTokensValidation,
  listElectionValidation,
  upsertConfigValidation,
  validateElectionIdParam,
  validateChoiceIdParam,
} from "./voting.validation";

const router = Router();

// ----------------------------------------------------------------
// Routes PUBLIQUES
// ----------------------------------------------------------------

// Liste des élections publiques ouvertes
router.get("/elections/public", listElectionValidation, ctrl.getElections);

// Détail par slug (pour la page publique de vote)
router.get("/elections/slug/:slug", ctrl.getElectionBySlug);

// Vote par token anonyme (pas besoin de compte)
router.post(
  "/:electionId/vote/token",
  voteByTokenValidation,
  ctrl.voterParToken,
);

// Résultats (publics si afficherResultats = true)
router.get("/:electionId/resultats", ctrl.getResultats);

// ----------------------------------------------------------------
// Routes PRIVÉES (connecté requis)
// ----------------------------------------------------------------
router.use(authenticate);

// Liste et détail admin
router.get("/elections", listElectionValidation, ctrl.getElections);
router.get("/elections/:id", validateElectionIdParam, ctrl.getElectionById);

// Voter (utilisateur authentifié)
router.post("/:electionId/vote", voteValidation, ctrl.voterAuthentifie);

// Mon statut de vote pour une élection
router.get("/:electionId/statut", ctrl.getStatutVote);

// ----------------------------------------------------------------
// Routes STAFF uniquement
// ----------------------------------------------------------------

// CRUD élections
router.post(
  "/elections",
  isStaff,
  createElectionValidation,
  ctrl.createElection,
);
router.patch(
  "/elections/:id",
  validateElectionIdParam,
  isStaff,
  updateElectionValidation,
  ctrl.updateElection,
);
router.delete(
  "/elections/:id",
  validateElectionIdParam,
  isStaff,
  ctrl.deleteElection,
);

// Choix d'une élection
router.post(
  "/elections/:electionId/choix",
  isStaff,
  createChoiceValidation,
  ctrl.addChoice,
);
router.patch(
  "/choix/:choiceId",
  validateChoiceIdParam,
  isStaff,
  updateChoiceValidation,
  ctrl.updateChoice,
);
router.delete(
  "/choix/:choiceId",
  validateChoiceIdParam,
  isStaff,
  ctrl.deleteChoice,
);

// Tokens
router.post(
  "/elections/:electionId/tokens",
  isStaff,
  generateTokensValidation,
  ctrl.genererTokens,
);
router.get("/elections/:electionId/tokens", isStaff, ctrl.getTokens);

// Électeurs + export CSV
router.get("/elections/:electionId/electeurs", isStaff, ctrl.getElecteurs);
router.get(
  "/elections/:electionId/electeurs/export",
  isStaff,
  ctrl.exportElecteursCSV,
);

// Config globale
router.get("/config", isStaff, ctrl.getConfig);
router.patch("/config", isStaff, upsertConfigValidation, ctrl.upsertConfig);

export default router;
