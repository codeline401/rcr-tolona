// src/modules/mada/mada.routes.ts
// Définition des endpoints du module Mada (données géographiques)
// Elles sont utilsées pour alimenter les select du frontend

import { Router } from "express";
import * as madaController from "./mada.controller";

const router = Router();

// Recherche globale dans la géograhpie
// GET /api/mada/search=?q=antananarivo
router.get("/search", madaController.search);

// Arbre complet Province > Région > District
// GET /api/mada/tree
router.get("/tree", madaController.getFullTree);

// Provinces
// GET /api/mada/provinces
router.get("/provinces", madaController.getProvinces);

// Régions
// GET /api/mada/regions  -> Toutes les régions
// GET /api/mada/regions?provinceId=123 -> Régions d'une province
// GET /api/mada/regions/:id -> Détails d'une région (avec sa province et ses districts)
router.get("/regions", madaController.getRegions);
router.get("/regions/:id", madaController.getRegionById);

// Districts
// GET /api/mada/districts  -> Tous les districts
// GET /api/mada/districts?regionId=123 -> Districts d'une région
router.get("/districts", madaController.getDistricts);
router.get("/districts/:id", madaController.getDistrictById);

// Communes
// GET /api/mada/communes  -> Toutes les communes
// GET /api/mada/communes?districtId=123 -> Communes d'un district
router.get("/communes", madaController.getCommunes);

// Fokontany
// GET /api/mada/fokotany  -> Tous les fokontany
// GET /api/mada/fokotany?communeId=123 -> Fokontany d'une commune
router.get("/fokotany", madaController.getFokotany);

export default router;
