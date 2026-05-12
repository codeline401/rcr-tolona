// src/modules/finance/finance.controller.ts

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { success, error } from "../../utils/response";
import * as financeService from "./finance.service";

// ================================================================
// COMPTES
// ================================================================

export const getComptes = async (req: Request, res: Response) => {
  try {
    const actifSeulement = req.query.actif === "true";
    const data = await financeService.getComptes(actifSeulement);
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const getCompteById = async (req: Request, res: Response) => {
  try {
    const data = await financeService.getCompteById(req.params.id as string);
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message, 404);
  }
};

export const createCompte = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const data = await financeService.createCompte(req.body);
    return success(res, data, "Compte créé", 201);
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

export const updateCompte = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const data = await financeService.updateCompte(
      req.params.id as string,
      req.body,
    );
    return success(res, data, "Compte mis à jour");
  } catch (err: any) {
    if (err.message === "Compte introuvable") return error(res, err.message, 404);
    return error(res, err.message, 400);
  }
};

// ================================================================
// TRANSACTIONS
// ================================================================

export const getTransactions = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Paramètres invalides", 400, errors.array());

  try {
    const result = await financeService.getTransactions({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 30,
      compteId: req.query.compteId as string,
      type: req.query.type as string,
      source: req.query.source as string,
      annule:
        req.query.annule !== undefined
          ? req.query.annule === "true"
          : undefined,
    });
    return success(res, result);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const data = await financeService.createTransaction(req.body, req.user!.id);
    return success(res, data, "Transaction enregistrée", 201);
  } catch (err: any) {
    if (/introuvable/i.test(err.message)) return error(res, err.message, 404);
    if (/insuffisant/i.test(err.message)) return error(res, err.message, 422);
    return error(res, err.message, 400);
  }
};

export const annulerTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const data = await financeService.annulerTransaction(
      req.params.id as string,
      req.user!.id,
    );
    return success(res, data, "Transaction annulée par contrepassation");
  } catch (err: any) {
    if (/introuvable/i.test(err.message)) return error(res, err.message, 404);
    if (/déjà annulée/i.test(err.message)) return error(res, err.message, 409);
    return error(res, err.message, 400);
  }
};

// ================================================================
// RÉPARTITION
// ================================================================

export const calculerRepartition = async (req: Request, res: Response) => {
  try {
    // paiementId passé dans l'URL
    const data = await financeService.calculerRepartition(
      req.params.paiementId as string,
    );
    return success(res, data, "Répartition calculée");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

// ================================================================
// WALLET
// ================================================================

export const getWallet = async (req: AuthRequest, res: Response) => {
  try {
    // Un utilisateur peut voir son propre wallet
    // Un staff peut voir celui de n'importe quel utilisateur
    const utilisateurId = req.params.userId || req.user!.id;
    const data = await financeService.getOrCreateWallet(
      utilisateurId as string,
    );
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message);
  }
};

// ================================================================
// DASHBOARD
// ================================================================

export const getDashboard = async (_req: Request, res: Response) => {
  try {
    const data = await financeService.getDashboard();
    return success(res, data);
  } catch (err: any) {
    return error(res, err.message);
  }
};
