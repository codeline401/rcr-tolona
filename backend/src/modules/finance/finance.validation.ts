// src/modules/finance/finance.validation.ts
// Règles de validation pour le module finance.

import { body, query } from "express-validator";

// ----------------------------------------------------------------
// COMPTE FINANCIER
// ----------------------------------------------------------------
export const createCompteValidation = [
  body("nom")
    .trim()
    .notEmpty()
    .withMessage("Le nom du compte est requis")
    .isLength({ max: 150 })
    .withMessage("Nom trop long"),

  // Au plus UN des trois identifiants peut être fourni
  body("membreId").optional({ nullable: true }).isUUID(),
  body("districtId").optional({ nullable: true }).isUUID(),
  body("paysId").optional({ nullable: true }).isUUID(),
];

// ----------------------------------------------------------------
// TRANSACTION
// ----------------------------------------------------------------
export const createTransactionValidation = [
  body("type")
    .isIn(["ENTREE", "SORTIE"])
    .withMessage("Type invalide : ENTREE ou SORTIE"),

  body("source")
    .isIn(["COTISATION", "CONTRIBUTION", "DEPENSE", "AUTRE"])
    .withMessage("Source invalide"),

  body("montant")
    .isDecimal({ decimal_digits: "0,2" })
    .withMessage("Montant invalide")
    .custom((val) => parseFloat(val) > 0)
    .withMessage("Le montant doit être supérieur à 0"),

  body("compteId").notEmpty().withMessage("Le compte est requis").isUUID(),

  body("description").optional().trim().isLength({ max: 500 }),

  body("reference").optional().trim().isLength({ max: 120 }),
];

// ----------------------------------------------------------------
// FILTRES de liste transactions
// ----------------------------------------------------------------
export const listTransactionValidation = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("compteId").optional().isUUID(),
  query("type").optional().isIn(["ENTREE", "SORTIE"]),
  query("source")
    .optional()
    .isIn(["COTISATION", "CONTRIBUTION", "DEPENSE", "AUTRE"]),
  query("annule").optional().isBoolean().toBoolean(),
];
