// src/modules/mada/mada.controller.ts
// Reçoit les requêtes HTTP liées aux données géographiques de Mada, appelle le service, renvoie la réponse
// Pas de logique métier ici, seulement req/res

import { Request, Response } from "express";
import { success, error } from "../../utils/response";
import * as madaService from "./mada.service";

// ------------------------------------------------------------------------
// GET /api/mada/provinces - Récupérer la liste des provinces
// ------------------------------------------------------------------------
export const getProvinces = async (_req: Request, res: Response) => {
  try {
    const provinces = await madaService.getProvinces();
    return success(res, provinces, "Provinces récupérées avec succès");
  } catch (err) {
    return error(
      res,
      "Erreur lors de la récupération des provinces: " + (err as Error).message,
    );
  }
};

// ------------------------------------------------------------------------
// GET /api/mada/regions - Récupérer la liste des régions (optionnellement filtrée par province)
// ------------------------------------------------------------------------
export const getRegions = async (req: Request, res: Response) => {
  try {
    // ?provinceId=123 -> filtrer par province
    const data = await madaService.getRegions(req.query.provinceId as string);
    return success(res, data, "Régions récupérées avec succès");
  } catch (err) {
    return error(
      res,
      "Erreur lors de la récupération des régions: " + (err as Error).message,
    );
  }
};

// ------------------------------------------------------------------------
// GET /api/mada/regions/:id - Récupérer une région par son ID (avec sa province et ses districts)
// ------------------------------------------------------------------------
export const getRegionById = async (req: Request, res: Response) => {
  try {
    const data = await madaService.getRegionById(req.params.id as string);
    return success(res, data, "Région récupérée avec succès");
  } catch (err) {
    return error(
      res,
      "Erreur lors de la récupération de la région: " + (err as Error).message,
    );
  }
};

// ------------------------------------------------------------------------
// GET /api/mada/districts - Récupérer la liste des districts (optionnellement filtrée par région)
// ------------------------------------------------------------------------
export const getDistricts = async (req: Request, res: Response) => {
  try {
    const data = await madaService.getDistricts(req.query.regionId as string);
    return success(res, data, "Districts récupérés avec succès");
  } catch (err) {
    return error(
      res,
      "Erreur lors de la récupération des districts: " + (err as Error).message,
    );
  }
};

// ------------------------------------------------------------------------
// GET /api/mada/districts/:id - Récupérer un district par son ID (avec sa région et ses communes)
// ------------------------------------------------------------------------
export const getDistrictById = async (req: Request, res: Response) => {
  try {
    const data = await madaService.getDistrictById(req.params.id as string);
    return success(res, data, "District récupéré avec succès");
  } catch (err) {
    return error(
      res,
      "Erreur lors de la récupération du district: " + (err as Error).message,
    );
  }
};

// ------------------------------------------------------------------------
// GET /api/mada/communes - Récupérer la liste des communes (optionnellement filtrée par district)
// ------------------------------------------------------------------------
export const getCommunes = async (req: Request, res: Response) => {
  try {
    const data = await madaService.getCommunes(req.query.districtId as string);
    return success(res, data, "Communes récupérées avec succès");
  } catch (err) {
    return error(
      res,
      "Erreur lors de la récupération des communes: " + (err as Error).message,
    );
  }
};

// ------------------------------------------------------------------------
// GET /api/mada/fokotany - Récupérer la liste des fokotany (optionnellement filtrée par commune)
// ------------------------------------------------------------------------
export const getFokotany = async (req: Request, res: Response) => {
  try {
    const data = await madaService.getFokotany(req.query.communeId as string);
  } catch (err) {
    return error(
      res,
      "Erreur lors de la récupération des fokotany: " + (err as Error).message,
    );
  }
};

// ------------------------------------------------------------------------
// GET /api/mada/full-tree - Récupérer l'arbre complet (provinces > régions > districts > communes > fokotany)
// ------------------------------------------------------------------------
export const getFullTree = async (_req: Request, res: Response) => {
  try {
    const data = await madaService.getFullTree();
    return success(res, data, "Arbre complet récupéré avec succès");
  } catch (err) {
    return error(
      res,
      "Erreur lors de la récupération de l'arbre complet: " +
        (err as Error).message,
    );
  }
};

// -----------------------------------------------------------
// RECHERCHE - Récupérer une région par son ID (avec sa province et ses districts)
// -----------------------------------------------------------
export const search = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim() === "") {
      return error(res, "Le paramètre de recherche 'q' est requis", 400);
    }
    const data = await madaService.search(query);
    return success(res, data, "Résultats de recherche récupérés avec succès");
  } catch (err) {
    return error(res, "Erreur lors de la recherche: " + (err as Error).message);
  }
};
