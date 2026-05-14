// src/modules/blog/blog.validation.ts
// Règles de validation pour la création et modification d'articles.

import { body, query } from "express-validator";

// ----------------------------------------------------------------
// Règles de création d'un article
// ----------------------------------------------------------------
export const createPostValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Le titre est requis")
    .isLength({ max: 250 })
    .withMessage("Titre trop long (max 250 caractères)"),

  body("body").trim().notEmpty().withMessage("Le contenu est requis"),

  body("excerpt")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Résumé trop long"),

  body("status")
    .optional()
    .isIn(["DF", "PB"])
    .withMessage("Statut invalide : DF (brouillon) ou PB (publié)"),

  body("publish")
    .optional()
    .isISO8601()
    .withMessage("Date de publication invalide"),
];

// ----------------------------------------------------------------
// Règles de modification (tous les champs optionnels → PATCH)
// ----------------------------------------------------------------
export const updatePostValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ max: 250 })
    .withMessage("Titre trop long"),

  body("body")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Le contenu ne peut pas être vide"),

  body("excerpt").optional().trim(),

  body("status")
    .optional()
    .isIn(["DF", "PB"])
    .withMessage("Statut invalide : DF ou PB"),

  body("publish")
    .optional()
    .isISO8601()
    .withMessage("Date de publication invalide"),
];

// ----------------------------------------------------------------
// Validation des paramètres de liste
// ----------------------------------------------------------------
export const listPostValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page invalide")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limite invalide")
    .toInt(),

  query("status").optional().isIn(["DF", "PB"]).withMessage("Statut invalide"),
];
