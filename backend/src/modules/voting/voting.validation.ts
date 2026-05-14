// src/modules/voting/voting.validation.ts
// Règles de validation pour toutes les opérations du module voting.

import { body, query, param } from "express-validator";

// ----------------------------------------------------------------
// ÉLECTION
// ----------------------------------------------------------------
export const createElectionValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Le titre est requis")
    .isLength({ max: 200 })
    .withMessage("Titre trop long"),

  body("description").optional().trim(),

  body("startAt")
    .isISO8601()
    .withMessage("Date de début invalide (format : ISO 8601)")
    .toDate(),

  body("endAt")
    .isISO8601()
    .withMessage("Date de fin invalide")
    .toDate()
    // Vérifier que la fin est après le début
    .custom((endAt, { req }) => {
      if (new Date(endAt) <= new Date(req.body.startAt)) {
        throw new Error("La date de fin doit être après la date de début");
      }
      return true;
    }),

  body("public").optional().isBoolean(),

  body("afficherResultats").optional().isBoolean(),
];

export const updateElectionValidation = [
  body("title").optional().trim().isLength({ max: 200 }),
  body("description").optional().trim(),
  body("startAt").optional().isISO8601().toDate(),
  body("endAt").optional().isISO8601().toDate(),
  body("public").optional().isBoolean(),
  body("afficherResultats").optional().isBoolean(),
];

// ----------------------------------------------------------------
// CHOIX (candidats / options)
// ----------------------------------------------------------------
export const createChoiceValidation = [
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Le texte du choix est requis")
    .isLength({ max: 200 })
    .withMessage("Texte trop long"),

  body("description").optional().trim(),
];

// ----------------------------------------------------------------
// VOTE — par utilisateur authentifié
// ----------------------------------------------------------------
export const voteValidation = [
  body("choiceId")
    .notEmpty()
    .withMessage("Le choix est requis")
    .isUUID()
    .withMessage("ID de choix invalide"),
];

// ----------------------------------------------------------------
// VOTE — par token anonyme
// ----------------------------------------------------------------
export const voteByTokenValidation = [
  body("token")
    .notEmpty()
    .withMessage("Le token est requis")
    .isUUID()
    .withMessage("Format de token invalide"),

  body("choiceId")
    .notEmpty()
    .withMessage("Le choix est requis")
    .isUUID()
    .withMessage("ID de choix invalide"),
];

// ----------------------------------------------------------------
// GÉNÉRATION DE TOKENS
// ----------------------------------------------------------------
export const generateTokensValidation = [
  body("count")
    .isInt({ min: 1, max: 500 })
    .withMessage("Nombre de tokens invalide (1 à 500)"),
];

// ----------------------------------------------------------------
// FILTRES de liste
// ----------------------------------------------------------------
export const listElectionValidation = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
  query("open").optional().isBoolean().toBoolean(),
];
