// src/modules/membre/membre.validation.ts
// Règles de validation pour la création et la mise à jour d'un membre

import { body, query } from "express-validator";

// ----------------------------------------------------------------------------
// Règles communes : utilisées à la création ET à la modification
// (on le réutilise dans les deux routes pour éviter les doublons)
// ----------------------------------------------------------------------------
const communRules = [
  body("nom")
    .trim()
    .notEmpty()
    .withMessage("Le nom est requis.")
    .isLength({ min: 3, max: 100 })
    .withMessage("Le nom doit comporter entre 3 et 100 caractères."),

  body("prenom")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Le prénom doit comporter au maximum 100 caractères."),

  body("sexe").isIn(["M", "F"]).withMessage('Le sexe doit être "M" ou "F".'),

  body("dateNaissance")
    .isISO8601()
    .withMessage(
      "La date de naissance doit être au format ISO 8601 (YYYY-MM-DD).",
    )
    .toDate(),

  body("cin")
    .trim()
    .notEmpty()
    .withMessage("Le CIN est requis.")
    .isLength({ min: 12 })
    .withMessage("Le CIN doit comporter au moins 12 caractères."),

  body("telephone")
    .trim()
    .notEmpty()
    .withMessage("Le numéro de téléphone est requis.")
    .isMobilePhone("any")
    .withMessage("Le numéro de téléphone doit être valide."),

  body("email")
    .optional({ nullable: true })
    .isEmail()
    .withMessage("L'adresse email doit être valide.")
    .normalizeEmail(),

  body("anneeDecouverte")
    .trim()
    .notEmpty()
    .withMessage("L'année de découverte est requise.")
    .isInt({ min: 2011, max: new Date().getFullYear() })
    .withMessage(
      `L'année de découverte doit être un entier entre 2011 et ${new Date().getFullYear()}.`,
    ),

  body("canalDecouverte")
    .trim()
    .notEmpty()
    .withMessage("Le canal de découverte est requis.")
    .isLength({ max: 255 })
    .withMessage(
      "Le canal de découverte doit comporter au maximum 255 caractères.",
    ),

  body("motivation")
    .trim()
    .notEmpty()
    .withMessage("La motivation est requise."),

  body("niveauEtude")
    .trim()
    .notEmpty()
    .withMessage("Le niveau d'étude est requis."),

  body("metier").trim().notEmpty().withMessage("Le métier est requis."),

  body("engagement").trim().notEmpty().withMessage("L'engagement est requis."),
];

// ----------------------------------------------------------------------------
// Création d'un membre : toutes les règles obligatoires
// ----------------------------------------------------------------------------
export const createMemberValidation = [...communRules];

// ----------------------------------------------------------------------------
// Mise à jour d'un membre : tous les champs sont optionnels (PATCH)
// On marque chaque règle comme optionnel
// ----------------------------------------------------------------------------
export const updateMemberValidation = communRules.map((rule) =>
  rule.optional({ nullable: true }),
);

// ----------------------------------------------------------------------------
// Validation de changement de validité
// (approuver, rejeter ou inscription)
// ----------------------------------------------------------------------------
export const updateValidityValidation = [
  body("validityStatus")
    .isIn([1, 2, 3])
    .withMessage(
      "Le statut de validité doit être 1 (approuvé), 2 (rejeté) ou 3 (en attente).",
    ),

  body("comment")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Le commentaire doit comporter au maximum 500 caractères."),
];

// ----------------------------------------------------------------------------
// Validation des paramètres de la liste (pagination + filtres)
// ----------------------------------------------------------------------------
export const listMemberValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page Invalide")
    .toInt(),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit Invalide")
    .toInt(),

  query("status").optional().isIn(["actif", "passif"]),

  query("validityStatus").optional().isInt({ min: 1, max: 3 }).toInt(),
];
