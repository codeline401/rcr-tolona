// src/modules/auth/auth.validation.ts
// Règles de validation pour les données reçues pour chaque endpoint auth.
// express-validator vérifie les données avant qu'elles arrivent aux contrôleurs.

import { body } from "express-validator";

// --- Règles pour POST /auth/login ---
export const loginValidation = [
  body("email").isEmail().withMessage("Email invalide").normalizeEmail(), // convertit l'email en minuscule et supprime les espaces

  body("password").notEmpty().withMessage("Le mot de passe est requis"),
];

export const registerValidation = [
  body("email").isEmail().withMessage("Email invalide").normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères")
    .matches(/[A-Z]/)
    .withMessage("Le mot de passe doit contenir au moins une lettre majuscule")
    .matches(/[a-z]/)
    .withMessage("Le mot de passe doit contenir au moins une lettre minuscule")
    .matches(/[0-9]/)
    .withMessage("Le mot de passe doit contenir au moins un chiffre"),

  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Les mots de passe ne correspondent pas"),
];

// --- Règle pour POST /auth/forgot-password ---
export const forgotPasswordValidation = [
  body("email").isEmail().withMessage("Email invalide").normalizeEmail(),
];

// --- Règle pour POST /auth/reset-password ---
export const resetPasswordValidation = [
  body("token")
    .notEmpty()
    .withMessage("Le token de réinitialisation est requis"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères")
    .matches(/[A-Z]/)
    .withMessage("Le mot de passe doit contenir au moins une lettre majuscule")
    .matches(/[a-z]/)
    .withMessage("Le mot de passe doit contenir au moins une lettre minuscule")
    .matches(/[0-9]/)
    .withMessage("Le mot de passe doit contenir au moins un chiffre"),
];
