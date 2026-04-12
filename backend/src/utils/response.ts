// src/utils/response.ts
// Helpers pour envoyer des réponses API uniformes dans tout le projet.

import { Response } from "express";

// Réponse succès standard
export const success = (
  res: Response,
  data: any,
  message = "Succès",
  statusCode = 200,
) => {
  res.status(statusCode).json({ success: true, message, data });
};

// Réponse erreur standard
export const error = (
  res: Response,
  message = "Erreur serveur",
  statusCode = 500,
  details?: any,
) => {
  res.status(statusCode).json({ success: false, message, details });
};
