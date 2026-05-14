// src/modules/activites/activites.controller.ts

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { success, error } from "../../utils/response";
import * as activitesService from "./activites.service";

// ================================================================
// ACTIVITÉS
// ================================================================

export const getActivites = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Paramètres invalides", 400, errors.array());

  try {
    const result = await activitesService.getActivites({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      search: req.query.search as string,
      districtId: req.query.districtId as string,
      finished:
        req.query.finished !== undefined
          ? req.query.finished === "true"
          : undefined,
      canceled:
        req.query.canceled !== undefined
          ? req.query.canceled === "true"
          : undefined,
    });
    return success(res, result);
  } catch (err: any) {
    return error(res, err.message);
  }
};

// Route publique — seulement les activités publiques non annulées
export const getActivitesPubliques = async (req: Request, res: Response) => {
  try {
    const result = await activitesService.getActivites({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      search: req.query.search as string,
      publique: true,
      canceled: false,
    });
    return success(res, result);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const getActiviteById = async (req: Request, res: Response) => {
  try {
    const data = await activitesService.getActiviteById(
      req.params.id as string,
    );
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message, 404);
  }
};

export const createActivite = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    // req.file est fourni si une illustration a été uploadée (multer)
    const illustrationPath = req.file
      ? `illustrations/${req.file.filename}`
      : undefined;

    const data = await activitesService.createActivite(
      req.body,
      illustrationPath,
    );
    return success(res, data, "Activité créée", 201);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const updateActivite = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const newIllustration = req.file
      ? `illustrations/${req.file.filename}`
      : undefined;

    const data = await activitesService.updateActivite(
      req.params.id as string,
      req.body,
      newIllustration,
    );
    return success(res, data, "Activité mise à jour");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const deleteActivite = async (req: Request, res: Response) => {
  try {
    await activitesService.deleteActivite(req.params.id as string);
    return success(res, null, "Activité supprimée");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const terminerActivite = async (req: Request, res: Response) => {
  try {
    const data = await activitesService.terminerActivite(
      req.params.id as string,
    );
    return success(res, data, "Activité marquée comme terminée");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const annulerActivite = async (req: AuthRequest, res: Response) => {
  try {
    // Récupérer le membre associé à l'utilisateur connecté si possible
    const data = await activitesService.annulerActivite(
      req.params.id as string,
      req.user?.id,
    );
    return success(res, data, "Activité annulée");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const getStats = async (_req: Request, res: Response) => {
  try {
    const data = await activitesService.getStats();
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message);
  }
};

// ================================================================
// ÉTAPES
// ================================================================

export const getEtapes = async (req: Request, res: Response) => {
  try {
    const data = await activitesService.getEtapes(req.params.id as string);
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message, 404);
  }
};

export const createEtape = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const data = await activitesService.createEtape(
      req.params.id as string,
      req.body,
    );
    return success(res, data, "Étape créée", 201);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const updateEtape = async (req: Request, res: Response) => {
  try {
    const data = await activitesService.updateEtape(
      req.params.etapeId as string,
      req.body,
    );
    return success(res, data, "Étape mise à jour");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const deleteEtape = async (req: Request, res: Response) => {
  try {
    await activitesService.deleteEtape(req.params.etapeId as string);
    return success(res, null, "Étape supprimée");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

// ================================================================
// POSTES BUDGÉTAIRES
// ================================================================

export const getPostesBudget = async (req: Request, res: Response) => {
  try {
    const data = await activitesService.getPostesBudget(
      req.params.id as string,
    );
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const createPosteBudget = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const data = await activitesService.createPosteBudget(
      req.params.id as string,
      req.body,
    );
    return success(res, data, "Poste budgétaire créé", 201);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const updatePosteBudget = async (req: Request, res: Response) => {
  try {
    const data = await activitesService.updatePosteBudget(
      req.params.posteId as string,
      req.body,
    );
    return success(res, data, "Poste mis à jour");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const deletePosteBudget = async (req: Request, res: Response) => {
  try {
    await activitesService.deletePosteBudget(req.params.posteId as string);
    return success(res, null, "Poste supprimé");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

// ================================================================
// CONTRIBUTIONS
// ================================================================

export const getContributions = async (req: Request, res: Response) => {
  try {
    const data = await activitesService.getContributions(
      req.params.id as string,
    );
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message, 404);
  }
};

export const createContribution = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const data = await activitesService.createContribution(
      req.params.id as string,
      req.body,
    );
    return success(res, data, "Contribution enregistrée", 201);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const updateStatutContribution = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const data = await activitesService.updateStatutContribution(
      req.params.contributionId as string,
      req.body.statut,
    );
    return success(res, data, "Statut de la contribution mis à jour");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};
