// src/modules/voting/voting.controller.ts

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { success, error } from "../../utils/response";
import * as votingService from "./voting.service";

// ================================================================
// ÉLECTIONS
// ================================================================

export const getElections = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Paramètres invalides", 400, errors.array());

  try {
    const result = await votingService.getElections({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      open:
        req.query.open !== undefined ? req.query.open === "true" : undefined,
    });
    return success(res, result);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const getElectionById = async (req: Request, res: Response) => {
  try {
    const data = await votingService.getElectionById(req.params.id as string);
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message, 404);
  }
};

export const getElectionBySlug = async (req: Request, res: Response) => {
  try {
    const data = await votingService.getElectionBySlug(
      req.params.slug as string,
    );
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message, 404);
  }
};

export const createElection = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const data = await votingService.createElection(req.body);
    return success(res, data, "Élection créée", 201);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const updateElection = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const data = await votingService.updateElection(
      req.params.id as string,
      req.body,
    );
    return success(res, data, "Élection mise à jour");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const deleteElection = async (req: Request, res: Response) => {
  try {
    await votingService.deleteElection(req.params.id as string);
    return success(res, null, "Élection supprimée");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

// ================================================================
// CHOIX
// ================================================================

export const addChoice = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const data = await votingService.addChoice(
      req.params.electionId as string,
      req.body,
    );
    return success(res, data, "Choix ajouté", 201);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const updateChoice = async (req: Request, res: Response) => {
  try {
    const data = await votingService.updateChoice(
      req.params.choiceId as string,
      req.body,
    );
    return success(res, data, "Choix mis à jour");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const deleteChoice = async (req: Request, res: Response) => {
  try {
    await votingService.deleteChoice(req.params.choiceId as string);
    return success(res, null, "Choix supprimé");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

// ================================================================
// VOTES
// ================================================================

// Vote d'un utilisateur authentifié
export const voterAuthentifie = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const vote = await votingService.voterAuthentifie(
      req.params.electionId as string,
      req.body.choiceId as string,
      req.user!.id as string,
    );
    return success(res, vote, "Vote enregistré", 201);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

// Vote anonyme par token
export const voterParToken = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const vote = await votingService.voterParToken(
      req.params.electionId as string,
      req.body.choiceId as string,
      req.body.token as string,
    );
    return success(res, vote, "Vote anonyme enregistré", 201);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

// Statut de vote de l'utilisateur connecté
export const getStatutVote = async (req: AuthRequest, res: Response) => {
  try {
    const data = await votingService.getStatutVote(
      req.params.electionId as string,
      req.user!.id as string,
    );
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message);
  }
};

// ================================================================
// RÉSULTATS
// ================================================================

export const getResultats = async (req: Request, res: Response) => {
  try {
    const data = await votingService.getResultats(
      req.params.electionId as string,
    );
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message, 404);
  }
};

// ================================================================
// TOKENS
// ================================================================

export const genererTokens = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const data = await votingService.genererTokens(
      req.params.electionId as string,
      req.body.count as number,
    );
    return success(res, data, `${data.count} tokens générés`, 201);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const getTokens = async (req: Request, res: Response) => {
  try {
    const data = await votingService.getTokens(req.params.electionId as string);
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message);
  }
};

// ================================================================
// ÉLECTEURS
// ================================================================

export const getElecteurs = async (req: Request, res: Response) => {
  try {
    const filtre =
      (req.query.filtre as "tous" | "voted" | "not_voted") || "tous";
    const data = await votingService.getElecteurs(
      req.params.electionId as string,
      filtre,
    );
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message);
  }
};

// Export CSV — retourne un fichier téléchargeable
export const exportElecteursCSV = async (req: Request, res: Response) => {
  try {
    const filtre =
      (req.query.filtre as "tous" | "voted" | "not_voted") || "tous";
    const csv = await votingService.exportElecteursCSV(
      req.params.electionId as string,
      filtre,
    );

    // Définir les headers pour un téléchargement de fichier CSV
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="electeurs_${req.params.electionId}_${filtre}.csv"`,
    );
    res.send("\uFEFF" + csv); // \uFEFF = BOM UTF-8 pour que Excel l'ouvre correctement
  } catch (err: any) {
    return error(res, err.message);
  }
};

// ================================================================
// CONFIG
// ================================================================

export const getConfig = async (_req: Request, res: Response) => {
  try {
    const data = await votingService.getConfig();
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const upsertConfig = async (req: Request, res: Response) => {
  try {
    const data = await votingService.upsertConfig(req.body);
    return success(res, data, "Configuration mise à jour");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};
