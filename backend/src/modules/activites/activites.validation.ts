// src/modules/activites/activites.validation.ts

import { body, query } from "express-validator";

// ----------------------------------------------------------------
// ACTIVITÉ principale
// ----------------------------------------------------------------
export const createActiviteValidation = [
  body("titre")
    .trim()
    .notEmpty()
    .withMessage("Le titre est requis")
    .isLength({ max: 200 }),

  body("description").optional().trim(),
  body("lieu").optional().trim(),
  body("publique").optional().isBoolean(),

  body("dateDebut").isISO8601().withMessage("Date de début invalide").toDate(),

  body("dateFin")
    .isISO8601()
    .withMessage("Date de fin invalide")
    .toDate()
    .custom((dateFin, { req }) => {
      if (new Date(dateFin) < new Date(req.body.dateDebut)) {
        throw new Error("La date de fin doit être après la date de début");
      }
      return true;
    }),

  body("budgetPrevu")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Budget invalide"),

  body("objectifFinancement")
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Objectif de financement invalide"),

  body("responsableId").optional({ nullable: true }).isUUID(),
  body("districtId").optional({ nullable: true }).isUUID(),
];

export const updateActiviteValidation = [
  body("titre").optional().trim().isLength({ max: 200 }),
  body("description").optional().trim(),
  body("lieu").optional().trim(),
  body("publique").optional().isBoolean(),
  body("dateDebut").optional().isISO8601().toDate(),
  body("dateFin").optional().isISO8601().toDate(),
  body("budgetPrevu").optional().isDecimal({ decimal_digits: "0,2" }),
  body("objectifFinancement")
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: "0,2" }),
  body("responsableId").optional({ nullable: true }).isUUID(),
  body("districtId").optional({ nullable: true }).isUUID(),
];

// ----------------------------------------------------------------
// ÉTAPE
// ----------------------------------------------------------------
export const createEtapeValidation = [
  body("nom").trim().notEmpty().withMessage("Nom de l'étape requis"),
  body("description").optional().trim(),
  body("dateDebut").isISO8601().withMessage("Date de début invalide").toDate(),
  body("dateFin")
    .isISO8601()
    .withMessage("Date de fin invalide")
    .toDate()
    .custom((dateFin, { req }) => {
      if (new Date(dateFin) < new Date(req.body.dateDebut)) {
        throw new Error("La date de fin doit être après la date de début");
      }
      return true;
    }),
  body("statut")
    .optional()
    .isIn(["non_demarre", "en_cours", "termine"])
    .withMessage("Statut invalide"),
];

// ----------------------------------------------------------------
// POSTE BUDGET
// ----------------------------------------------------------------
export const createPosteBudgetValidation = [
  body("nomPoste").trim().notEmpty().withMessage("Nom du poste requis"),
  body("montantPrevu")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Montant prévu invalide"),
  body("montantReel")
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: "0,2" }),
];

// ----------------------------------------------------------------
// CONTRIBUTION
// ----------------------------------------------------------------
export const createContributionValidation = [
  body("montant")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Montant invalide")
    .custom((v) => {
      if (parseFloat(v) <= 0) throw new Error("Le montant doit être positif");
      return true;
    }),
  body("contributeurId").optional({ nullable: true }).isUUID(),
  body("nomAnonyme").optional().trim(),
  body("emailAnonyme").optional().isEmail(),
  body("referencePaiement").optional().trim(),
];

export const validerContributionValidation = [
  body("statut")
    .isIn(["valide", "annule", "rembourse"])
    .withMessage("Statut invalide"),
];

// ----------------------------------------------------------------
// FILTRES DE LISTE
// ----------------------------------------------------------------
export const listActiviteValidation = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 50 }).toInt(),
  query("finished").optional().isBoolean().toBoolean(),
  query("canceled").optional().isBoolean().toBoolean(),
  query("districtId").optional().isUUID(),
  query("search").optional().trim(),
];
