// src/modules/membre/membre.controller.ts
// Reçoit les requêtes HTTP / appel le service / renvoie les réponses HTTP

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { success, error } from "../../utils/response";
import * as membreService from "./membre.service";
import { cp } from "node:fs";

// -----------------------------------------------------------------------
// GET /api/membres - liste paginée avec filtre
// -----------------------------------------------------------------------
export const getMembres = async (req: Request, res: Response) => {
  const errors = validationResult(req); // Vérifie les erreurs de validation
  if (!errors.isEmpty())
    return error(res, "Validation error", 400, errors.array());

  try {
    const result = await membreService.getMembres({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      search: req.query.search as string,
      statut: Number(req.query.statut),
      validityStatus: req.query.validityStatus
        ? Number(req.query.validityStatus)
        : undefined,
      districtId: req.query.districtId as string,
      isExcluded:
        req.query.isExcluded === "true"
          ? true
          : req.query.isExcluded === "false"
            ? false
            : undefined,
    });
    return success(res, result);
  } catch (err: any) {
    return error(res, err.message, 404);
  }
};

// -----------------------------------------------------------------------
// GET /api/membres/:id - détails d'un membre
// -----------------------------------------------------------------------
export const getMembreById = async (req: Request, res: Response) => {
  try {
    const membre = await membreService.getMemberById(req.params.id as string);
    if (!membre) return error(res, "Membre non trouvé", 404);
    return success(res, membre);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
};

// -----------------------------------------------------------------------
// POST /api/membre/ - créer un nouveau membre
// -----------------------------------------------------------------------
export const createMembre = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req); // Vérifie les erreurs de validation
  if (!errors.isEmpty())
    return error(res, "Validation error", 400, errors.array());

  try {
    // Si une photo a été uploadé, on récupère son chemin relatif
    const pathPhoto = req.file
      ? `/uploads/membres/${req.file.filename}`
      : undefined;

    const membre = await membreService.createMembre({
      data: req.body,
      photo: pathPhoto,
      createdBy: req.user?.id,
    });
    return success(res, membre, "Membre créé avec succès", 201);
  } catch (err: any) {
    return error(res, err.message, 500);
  }
};

// -----------------------------------------------------------------------
// PATCH /api/membre/:id - mettre à jour un membre
// -----------------------------------------------------------------------
export const updateMembre = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req); // Vérifie les erreurs de validation
  if (!errors.isEmpty())
    return error(res, "Validation error", 400, errors.array());

  try {
    // on vérifie si un photo a été ajoutée
    const pathPhoto = req.file
      ? `/uploads/membres/${req.file.filename}`
      : undefined;

    const membre = await membreService.updateMembre(
      req.params.id as string,
      req.body,
      pathPhoto,
    );
    return success(res, membre, "Membre mis à jour avec succès");
  } catch (err: any) {
    return error(res, err.message, 500);
  }
};

// -----------------------------------------------------------------------
// DELETE /api/membre/:id - supprimer un membre
// -----------------------------------------------------------------------
export const deleteMembre = async (req: AuthRequest, res: Response) => {
  try {
    await membreService.deleteMembre(req.params.id as string);
    return success(res, null, "Membre supprimé avec succès");
  } catch (err: any) {
    return error(res, err.message, 500);
  }
};

// -----------------------------------------------------------------------
// PATCH /api/membre/:id/status - changer le statut d'un membre
// -----------------------------------------------------------------------
export const updateValidityStatus = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req); // Vérifie les erreurs de validation
  if (!errors.isEmpty())
    return error(res, "Validation error", 400, errors.array());

  try {
    const membre = await membreService.updateValidityStatus(
      req.params.id as string,
      req.body.validityStatus,
      req.body.comment,
      req.user?.id,
    );
    return success(res, membre, "Statut de validité mis à jour avec succès");
  } catch (err: any) {
    return error(res, err.message, 500);
  }
};

// -----------------------------------------------------------------------
// PATCH /api/membre/:id/exclude - exclure
// -----------------------------------------------------------------------
export const excludeMembre = async (req: AuthRequest, res: Response) => {
  try {
    const membre = await membreService.exclureMembre(
      req.params.id as string,
      req.user!.id as string,
      req.body.raison || "Aucune raison fournie",
    );
    return success(res, membre, "Membre exclu avec succès");
  } catch (err: any) {
    return error(res, err.message, 500);
  }
};

// -----------------------------------------------------------------------
// GET /api/membre/stats - statistiques des membres
// -----------------------------------------------------------------------
export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await membreService.getStats();
    return success(res, stats);
  } catch (err) {
    return error(res, (err as Error).message, 500);
  }
};
