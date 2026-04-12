// src/middlewares/auth.middleware.ts
// Middleware qui vérifie le token JWT dans les headers de la requête.
// À utiliser sur toutes les routes qui nécessitent d'être connecté.

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// On étend le type Request d'Express pour y ajouter notre utilisateur
export interface AuthRequest extends Request {
  user?: {
    id: string;
    isStaff: boolean;
    isSuperuser: boolean;
  };
}

// Vérifie que le token JWT est présent et valide
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // Le token doit être dans le header : Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Token manquant. Veuillez vous connecter." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      isStaff: boolean;
      isSuperuser: boolean;
    };

    req.user = decoded; // on attache les infos du user à la requête
    next();
  } catch {
    res.status(401).json({ message: "Token invalide ou expiré." });
  }
};

// Vérifie que l'utilisateur connecté est un staff (admin)
export const isStaff = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user?.isStaff) {
    return res
      .status(403)
      .json({ message: "Accès refusé. Droits insuffisants." });
  }
  next();
};

// Vérifie que l'utilisateur connecté est superuser
export const isSuperuser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user?.isSuperuser) {
    return res
      .status(403)
      .json({ message: "Accès refusé. Droits superuser requis." });
  }
  next();
};
