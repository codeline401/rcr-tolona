// src/modules/cotisation/cotisation.validation.ts
// Règles de validation pour tous les endpoints du module cotisation.

import { body, query } from "express-validator";

// ----------------------------------------------------------------
// CAMPAGNE
// ----------------------------------------------------------------
export const createCampagneValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Le nom de la campagne est requis")
    .isLength({ max: 100 })
    .withMessage("Nom trop long"),

  body("annee").isInt({ min: 2000, max: 2100 }).withMessage("Année invalide"),

  body("dateDebut")
    .optional()
    .isISO8601()
    .withMessage("Date de début invalide"),

  body("dateFin")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("Date de fin invalide"),
];

// ----------------------------------------------------------------
// TYPE DE COTISATION
// ----------------------------------------------------------------
export const createTypeCotisationValidation = [
  body("name").trim().notEmpty().withMessage("Le nom du type est requis"),

  body("montantFixe")
    .optional({ nullable: true })
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Montant invalide"),

  body("nombreTranche")
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage("Nombre de tranches invalide (1 à 12)"),

  body("obligatoire").optional().isBoolean(),

  body("actif").optional().isBoolean(),
];

// ----------------------------------------------------------------
// COTISATION (assignation d'un membre à une campagne)
// ----------------------------------------------------------------
export const createCotisationValidation = [
  body("membreId").notEmpty().withMessage("Le membre est requis"),

  body("typeCotisationId")
    .notEmpty()
    .withMessage("Le type de cotisation est requis"),

  body("campagneId").notEmpty().withMessage("La campagne est requise"),

  body("montantTotal")
    .optional()
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Montant total invalide"),
];

// ----------------------------------------------------------------
// PAIEMENT
// ----------------------------------------------------------------
export const createPaiementValidation = [
  body("montant")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Montant invalide")
    .custom((val) => parseFloat(val) > 0)
    .withMessage("Le montant doit être supérieur à 0"),

  body("moyenPaiement")
    .optional()
    .isIn(["ESPECES", "MOBILE_MONEY", "VIREMENT", "CHEQUE", "AUTRE"])
    .withMessage("Moyen de paiement invalide"),

  body("datePaiement")
    .optional()
    .isISO8601()
    .withMessage("Date de paiement invalide"),

  body("trancheId").optional({ nullable: true }),

  body("reference").optional().trim().isLength({ max: 100 }),
];

// ----------------------------------------------------------------
// FILTRES de liste
// ----------------------------------------------------------------
export const listCotisationValidation = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("campagneId").optional().isString(),
  query("membreId").optional().isString(),
  query("payee").optional().isBoolean().toBoolean(),
];
