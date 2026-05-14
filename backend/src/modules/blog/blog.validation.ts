// src/modules/blog/blog.validation.ts
// Règles de validation pour la création et modification d'articles.

import { body, param, query } from "express-validator";
import { validationResult } from "express-validator";
import type { Request, Response, NextFunction } from "express";

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
    .notEmpty()
    .withMessage("Le titre ne peut pas être vide")
    .isLength({ max: 250 })
    .withMessage("Titre trop long"),

  body("body")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Le contenu ne peut pas être vide"),

  body("excerpt")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Résumé trop long"),

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

// ----------------------------------------------------------------
// Validation du paramètre :id (UUID v4)
// ----------------------------------------------------------------
const runValidator = (req: Request, res: Response, next: NextFunction): void => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    res.status(400).json({ errors: errs.array() });
    return;
  }
  next();
};

export const validateIdParam = [
  param("id").isUUID().withMessage("Identifiant invalide"),
  runValidator,
];

// ----------------------------------------------------------------
// Validation du paramètre :slug
// ----------------------------------------------------------------
export const validateSlug = [
  param("slug")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage("Slug invalide"),
  runValidator,
];
