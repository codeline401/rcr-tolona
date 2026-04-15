// src/modules/auth/auth.routes.ts
// Définition des endpoints du module auth

import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import * as authController from "./auth.controller";
import {
  forgotPasswordValidation,
  loginValidation,
  registerValidation,
  resetPasswordValidation,
} from "./auth.validation";

const router = Router();

// Routes publiques (pas besoin d'être connecté)
router.post("/login", loginValidation, authController.login);
router.post("/register", registerValidation, authController.register);
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  authController.forgotPawword,
);
router.post(
  "/reset-password",
  resetPasswordValidation,
  authController.resetPassword,
);

// Routes protégées (besoin d'être connecté)
router.get("/me", authenticate, authController.getMe);

export default router;
