// src/modules/auth/auth.controller.ts
// Reçoit les requêtes HTTP liées à l'authentification, appele le service,  renvoie la réponse
// Pas de logique métier ici, seulement req/res

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { success, error } from "../../utils/response";
import * as authService from "./auth.service";

// ------------------------------------------------------------------------
// LOGIN - POST /api/auth/login
// ------------------------------------------------------------------------
export const login = async (req: Request, res: Response) => {
  // Vérifier les erreur de validation (définies dans auth.validation.ts)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, "Données invalides", 400, errors.array());
  }

  try {
    const { email, password } = req.body; // Récupérer les données du corps de la requête
    const result = await authService.login(email, password); // Appeler le service pour faire le travail
    return success(res, result, "Connexion réussie"); // Envoyer une réponse de succès avec les données retournées par le service
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

// ------------------------------------------------------------------------
// REGISTER - POST /api/auth/register
// ------------------------------------------------------------------------
export const register = async (req: Request, res: Response) => {
  const errors = validationResult(req); // Vérifier les erreur de validation (définies dans auth.validation.ts)
  if (!errors.isEmpty()) {
    // Si il y a des erreurs, renvoyer une réponse d'erreur avec les détails
    return error(res, "Données invalides", 400, errors.array());
  }

  try {
    const { email, password } = req.body; // Récupérer les données du corps de la requête
    const result = await authService.register(email, password); // Appeler le service pour faire le travail
    return success(res, result, "Compte créé avec succès", 201); // Envoyer une réponse de succès avec les données retournées par le service
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

// ------------------------------------------------------------------------
// GET - /api/auth/me - Récupérer le profil de l'utilisateur connecté
// ------------------------------------------------------------------------
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await authService.getMe(req.user!.id); // Appeler le service pour récupérer les données de l'utilisateur connecté
    return success(res, user, "Profil récupéré avec succès"); // Envoyer une réponse de succès avec les données retournées par le service
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

// ------------------------------------------------------------------------
// POST - /api/auth/forgot-password - Envoyer un email de réinitialisation de mot de passe
// ------------------------------------------------------------------------
export const forgotPawword = async (req: Request, res: Response) => {
  const errors = validationResult(req); // Vérifier les erreur de validation (définies dans auth.validation.ts)
  if (!errors.isEmpty()) {
    return error(res, "Données invalides", 400, errors.array());
  }

  try {
    const { email } = req.body; // Récupérer les données du corps de la requête
    const tokan = await authService.forgotPassword(email); // Appeler le service pour faire le travail

    // TODO en prod: envoyer un email, ne pas retourner le token
    // ici on va le retourner pour tester plus facilement la fonctionnalité
    return success(
      res,
      process.env.NODE_ENV === "production" ? null : { token: tokan },
      "Email de réinitialisation envoyé si l'email existe",
    ); // Envoyer une réponse de succès
  } catch (err) {
    return error(res, (err as Error).message, 400);
  }
};

// ------------------------------------------------------------------------
// POST - /api/auth/reset-password - Réinitialiser le mot de passe avec un token
// ------------------------------------------------------------------------
export const resetPassword = async (req: Request, res: Response) => {
  const errors = validationResult(req); // Vérifier les erreur de validation (définies dans auth.validation.ts)
  if (!errors.isEmpty()) {
    return error(res, "Données invalides", 400, errors.array());
  }

  try {
    const { token, password } = req.body; // Récupérer les données du corps de la requête
    await authService.resetPassword(token, password); // Appeler le service pour faire le travail
    return success(res, null, "Mot de passe réinitialisé avec succès"); // Envoyer une réponse de succès
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};
