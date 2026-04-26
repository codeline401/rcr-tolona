// src/modules/membre/membre.validation.ts
// Règles de validation pour la création et la mise à jour d'un membre

import { body, query } from "express-validator";

const currentYear = new Date().getFullYear();

// ----------------------------------------------------------------------------
// Règles communes : retourne de nouvelles instances à chaque appel
// pour éviter la mutation des chaînes partagées entre createMemberValidation
// et updateMemberValidation
// ----------------------------------------------------------------------------
const buildCommunRules = () => [
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
    .notEmpty()
    .withMessage("L'année de découverte est requise.")
    .isInt({ min: 2011, max: currentYear })
    .withMessage(
      `L'année de découverte doit être un entier entre 2011 et ${currentYear}.`,
    )
    .toInt(),

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
export const createMemberValidation = [...buildCommunRules()];

// ----------------------------------------------------------------------------
// Mise à jour d'un membre : tous les champs sont optionnels (PATCH)
// On marque chaque règle comme optionnel
// ----------------------------------------------------------------------------
export const updateMemberValidation = buildCommunRules().map((rule) =>
  rule.optional({ nullable: true }),
);

// ----------------------------------------------------------------------------
// Validation de changement de validité
// (approuver, rejeter ou inscription)
// ----------------------------------------------------------------------------
export const updateValidityValidation = [
  body("validityStatus")
    .isIn([0, 1, 2, 3])
    .withMessage(
      "Le statut de validité doit être 0 (initial), 1 (en attente), 2 (validé) ou 3 (rejeté).",
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

  query("statut").optional().isIn(["actif", "passif"]).withMessage("Le statut doit être 'actif' ou 'passif'."),

  query("validityStatus").optional().isInt({ min: 0, max: 3 }).toInt().withMessage("Le statut de validité doit être un entier entre 0 et 3."),
];
