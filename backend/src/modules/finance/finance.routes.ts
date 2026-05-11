// src/modules/finance/finance.routes.ts
// Toutes les routes du module finance.
// Lecture : tous les utilisateurs connectés
// Écriture : staff uniquement

import { Router } from "express";
import { authenticate, isStaff } from "../../middlewares/auth.middleware";
import * as ctrl from "./finance.controller";
import {
  createCompteValidation,
  createTransactionValidation,
  listTransactionValidation,
} from "./finance.validation";

const router = Router();

// Toutes les routes nécessitent d'être connecté
router.use(authenticate);

// --- Dashboard financier global ---
// GET /api/finance/dashboard
router.get("/dashboard", ctrl.getDashboard);

// ----------------------------------------------------------------
// COMPTES  →  /api/finance/comptes
// ----------------------------------------------------------------
router.get("/comptes", ctrl.getComptes);
router.get("/comptes/:id", ctrl.getCompteById);
router.post("/comptes", isStaff, createCompteValidation, ctrl.createCompte);
router.patch("/comptes/:id", isStaff, ctrl.updateCompte);

// ----------------------------------------------------------------
// TRANSACTIONS  →  /api/finance/transactions
// ----------------------------------------------------------------
router.get("/transactions", listTransactionValidation, ctrl.getTransactions);
router.post(
  "/transactions",
  isStaff,
  createTransactionValidation,
  ctrl.createTransaction,
);
router.patch("/transactions/:id/annuler", isStaff, ctrl.annulerTransaction);

// ----------------------------------------------------------------
// RÉPARTITION  →  /api/finance/repartition/:paiementId
// Calcule la répartition analytique d'un paiement de cotisation
// ----------------------------------------------------------------
router.post("/repartition/:paiementId", isStaff, ctrl.calculerRepartition);

// ----------------------------------------------------------------
// WALLET  →  /api/finance/wallet
// ----------------------------------------------------------------
router.get("/wallet", ctrl.getWallet); // mon wallet
router.get("/wallet/:userId", isStaff, ctrl.getWallet); // wallet d'un autre user (staff)

export default router;
