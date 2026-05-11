// src/modules/cotisation/cotisation.controller.ts

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { success, error } from "../../utils/response";
import * as cotisationService from "./cotisation.service";

// ================================================================
// CAMPAGNES
// ================================================================

export const getCampagnes = async (_req: Request, res: Response) => {
  try {
    const data = await cotisationService.getCampagnes();
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const getCampagneById = async (req: Request, res: Response) => {
  try {
    const data = await cotisationService.getCampagneById(
      req.params.id as string,
    );
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message, 404);
  }
};

export const createCampagne = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const data = await cotisationService.createCampagne(req.body);
    return success(res, data, "Campagne créée", 201);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const updateCampagne = async (req: Request, res: Response) => {
  try {
    const data = await cotisationService.updateCampagne(
      req.params.id as string,
      req.body,
    );
    return success(res, data, "Campagne mise à jour");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const deleteCampagne = async (req: Request, res: Response) => {
  try {
    await cotisationService.deleteCampagne(req.params.id as string);
    return success(res, null, "Campagne supprimée");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

// ================================================================
// TYPES DE COTISATION
// ================================================================

export const getTypesCotisation = async (req: Request, res: Response) => {
  try {
    // ?actif=true → retourner uniquement les types actifs
    const actifSeulement = req.query.actif === "true";
    const data = await cotisationService.getTypesCotisation(actifSeulement);
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const createTypeCotisation = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const data = await cotisationService.createTypeCotisation(req.body);
    return success(res, data, "Type créé", 201);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const updateTypeCotisation = async (req: Request, res: Response) => {
  try {
    const data = await cotisationService.updateTypeCotisation(
      req.params.id as string,
      req.body,
    );
    return success(res, data, "Type mis à jour");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

// ================================================================
// COTISATIONS
// ================================================================

export const getCotisations = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Paramètres invalides", 400, errors.array());

  try {
    const result = await cotisationService.getCotisations({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      campagneId: req.query.campagneId as string,
      membreId: req.query.membreId as string,
      payee:
        req.query.payee !== undefined ? req.query.payee === "true" : undefined,
    });
    return success(res, result);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const getCotisationById = async (req: Request, res: Response) => {
  try {
    const data = await cotisationService.getCotisationById(
      req.params.id as string,
    );
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message, 404);
  }
};

export const createCotisation = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const data = await cotisationService.createCotisation(
      req.body,
      req.user?.id,
    );
    return success(res, data, "Cotisation créée avec ses tranches", 201);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const deleteCotisation = async (req: Request, res: Response) => {
  try {
    await cotisationService.deleteCotisation(req.params.id as string);
    return success(res, null, "Cotisation supprimée");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

// ================================================================
// PAIEMENTS
// ================================================================

export const createPaiement = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const paiement = await cotisationService.createPaiement(
      req.params.cotisationId as string,
      req.body,
      req.user!.id,
    );
    return success(res, paiement, "Paiement enregistré", 201);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const invaliderPaiement = async (req: Request, res: Response) => {
  try {
    const result = await cotisationService.invaliderPaiement(
      req.params.paiementId as string,
    );
    return success(res, result, "Paiement invalidé");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

// ================================================================
// STATS
// ================================================================

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await cotisationService.getStats(
      req.query.campagneId as string,
    );
    return success(res, stats);
  } catch (err: any) {
    return error(res, err.message);
  }
};
