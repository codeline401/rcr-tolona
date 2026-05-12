// src/modules/finance/finance.service.ts
// Logique métier du module finance.
// Gère : comptes, transactions (avec mise à jour atomique du solde),
//        répartition analytique des cotisations, wallets collecteurs.

import { Prisma } from "../../generated/prisma/client";
import prisma from "../../config/prisma";

const Decimal = Prisma.Decimal;
import crypto from "crypto";

// ================================================================
// COMPTES FINANCIERS
// ================================================================

// Lister tous les comptes avec leur solde et leur type
export const getComptes = async (actifSeulement = false) => {
  return prisma.compteFinancier.findMany({
    where: actifSeulement ? { actif: true } : undefined,
    include: {
      // Inclure le nom du membre/district/pays pour identifier le type de caisse
      membre: { select: { id: true, nom: true, prenom: true } },
      district: { select: { id: true, name: true } },
      pays: { select: { id: true, name: true } },
      _count: { select: { transactions: true } },
    },
    orderBy: { nom: "asc" },
  });
};

export const getCompteById = async (id: string) => {
  const compte = await prisma.compteFinancier.findUnique({
    where: { id },
    include: {
      membre: { select: { id: true, nom: true, prenom: true } },
      district: { select: { id: true, name: true } },
      pays: { select: { id: true, name: true } },
    },
  });
  if (!compte) throw new Error("Compte introuvable");
  return compte;
};

// Créer un compte financier
// Un seul de membreId/districtId/paysId peut être fourni à la fois
export const createCompte = async (data: {
  nom: string;
  membreId?: string;
  districtId?: string;
  paysId?: string;
}) => {
  // Vérifier qu'on ne lie pas à plusieurs entités en même temps
  const nbLiens = [data.membreId, data.districtId, data.paysId].filter(
    Boolean,
  ).length;
  if (nbLiens > 1) {
    throw new Error(
      "Un compte ne peut être lié qu'à une seule entité (membre, district ou pays)",
    );
  }

  // Vérifier l'unicité du nom
  const existing = await prisma.compteFinancier.findUnique({
    where: { nom: data.nom },
  });
  if (existing) throw new Error("Un compte avec ce nom existe déjà");

  return prisma.compteFinancier.create({
    data: {
      nom: data.nom,
      solde: new Decimal(0),
      actif: true,
      membreId: data.membreId || null,
      districtId: data.districtId || null,
      paysId: data.paysId || null,
    },
  });
};

export const updateCompte = async (
  id: string,
  data: { nom?: string; actif?: boolean },
) => {
  const compte = await prisma.compteFinancier.findUnique({ where: { id } });
  if (!compte) throw new Error("Compte introuvable");
  const updateData: { nom?: string; actif?: boolean } = {};
  if (data.nom !== undefined) updateData.nom = data.nom;
  if (data.actif !== undefined) updateData.actif = data.actif;
  return prisma.compteFinancier.update({ where: { id }, data: updateData });
};

// ================================================================
// TRANSACTIONS
// ================================================================

// Liste paginée avec filtres
export const getTransactions = async (params: {
  page?: number;
  limit?: number;
  compteId?: string;
  type?: string;
  source?: string;
  annule?: boolean;
}) => {
  const page = params.page || 1;
  const limit = params.limit || 30;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.compteId) where.compteId = params.compteId;
  if (params.type) where.type = params.type;
  if (params.source) where.source = params.source;
  if (params.annule !== undefined) where.annule = params.annule;

  const [total, transactions] = await Promise.all([
    prisma.transactionFinanciere.count({ where }),
    prisma.transactionFinanciere.findMany({
      where,
      skip,
      take: limit,
      include: {
        compte: { select: { id: true, nom: true } },
        createdBy: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    data: transactions,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// Créer une transaction ET mettre à jour le solde du compte atomiquement
export const createTransaction = async (
  data: {
    compteId: string;
    type: "ENTREE" | "SORTIE";
    source: string;
    montant: number;
    description?: string;
    reference?: string;
    cotisationId?: string;
    paiementCotisationId?: string;
  },
  createdById: string,
) => {
  // Vérifier que le compte existe et est actif
  const compte = await prisma.compteFinancier.findUnique({
    where: { id: data.compteId },
  });
  if (!compte) throw new Error("Compte introuvable");
  if (!compte.actif) throw new Error("Ce compte est inactif");

  // Générer une référence unique si non fournie
  const reference =
    data.reference ||
    `TXN-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  // Tout en transaction Prisma : créer la ligne + mettre à jour le solde atomiquement
  return prisma.$transaction(async (tx) => {
    if (data.type === "SORTIE") {
      // Décrémentation conditionnelle atomique : évite la race sur le solde
      const updated = await tx.compteFinancier.updateMany({
        where: { id: data.compteId, solde: { gte: new Decimal(data.montant) } },
        data: { solde: { decrement: new Decimal(data.montant) } },
      });
      if (updated.count === 0) {
        const c = await tx.compteFinancier.findUnique({
          where: { id: data.compteId },
        });
        throw new Error(
          `Solde insuffisant. Solde actuel : ${Number(c?.solde || 0).toFixed(2)} Ar`,
        );
      }
      return tx.transactionFinanciere.create({
        data: {
          type: data.type,
          source: data.source,
          montant: new Decimal(data.montant),
          reference,
          description: data.description || null,
          compteId: data.compteId,
          createdById,
          cotisationId: data.cotisationId || null,
          paiementCotisationId: data.paiementCotisationId || null,
          annule: false,
        },
      });
    }

    // ENTREE : créer d'abord la transaction, puis incrémenter le solde
    const transaction = await tx.transactionFinanciere.create({
      data: {
        type: data.type,
        source: data.source,
        montant: new Decimal(data.montant),
        reference,
        description: data.description || null,
        compteId: data.compteId,
        createdById,
        cotisationId: data.cotisationId || null,
        paiementCotisationId: data.paiementCotisationId || null,
        annule: false,
      },
    });

    await tx.compteFinancier.update({
      where: { id: data.compteId },
      data: { solde: { increment: new Decimal(data.montant) } },
    });

    return transaction;
  });
};

// Annuler une transaction par contrepassation
// (crée une transaction inverse pour annuler l'effet comptable)
export const annulerTransaction = async (id: string, createdById: string) => {
  return prisma.$transaction(async (tx) => {
    // Marquer comme annulée atomiquement — évite les doubles annulations concurrentes
    const updated = await tx.transactionFinanciere.updateMany({
      where: { id, annule: false },
      data: { annule: true },
    });
    if (updated.count === 0) {
      const existing = await tx.transactionFinanciere.findUnique({
        where: { id },
      });
      if (!existing) throw new Error("Transaction introuvable");
      throw new Error("Transaction déjà annulée");
    }

    // Recharger pour récupérer les détails
    const transaction = await tx.transactionFinanciere.findUniqueOrThrow({
      where: { id },
    });

    const typeInverse = transaction.type === "ENTREE" ? "SORTIE" : "ENTREE";
    const refContrepassation = `ANNUL-${transaction.reference}`;

    const contrepassation = await tx.transactionFinanciere.create({
      data: {
        type: typeInverse,
        source: transaction.source,
        montant: transaction.montant,
        reference: refContrepassation,
        description: `Annulation de : ${transaction.reference}`,
        compteId: transaction.compteId,
        createdById,
        transactionSourceId: id,
        annule: false,
      },
    });

    // Utiliser l'API Decimal pour éviter la perte de précision via Number()
    const delta =
      typeInverse === "ENTREE"
        ? transaction.montant
        : transaction.montant.neg();

    await tx.compteFinancier.update({
      where: { id: transaction.compteId },
      data: { solde: { increment: delta } },
    });

    return contrepassation;
  });
};

// ================================================================
// RÉPARTITION ANALYTIQUE DES COTISATIONS
// Règle : Madagascar → 60% district / 20% région / 20% national
//         Diaspora   → 100% national
// ================================================================
export const calculerRepartition = async (paiementId: string) => {
  // Vérifier si une répartition existe déjà (idempotent)
  const existing = await prisma.repartitionCotisation.findUnique({
    where: { paiementId },
  });
  if (existing) return existing;

  // Récupérer le paiement avec toutes les infos nécessaires
  const paiement = await prisma.paiementCotisation.findUnique({
    where: { id: paiementId },
    include: {
      cotisation: {
        include: {
          membre: {
            include: {
              nationalite: true,
              adresse: {
                include: {
                  fokontany: {
                    include: {
                      commune: {
                        include: {
                          district: { include: { region: true } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!paiement || !paiement.estValide) {
    throw new Error("Paiement invalide ou introuvable");
  }

  const membre = paiement.cotisation.membre;
  const montant = Number(paiement.montant);
  const estMadagascar = membre.nationalite?.name === "Madagascar";

  let partDistrict = 0;
  let partRegion = 0;
  let partNationale = 0;
  let districtId: string | null = null;
  let regionId: string | null = null;

  if (estMadagascar) {
    // Récupérer le district via l'adresse
    const district = membre.adresse?.fokontany?.commune?.district;
    if (!district)
      throw new Error(
        "Adresse du membre incomplète pour calculer la répartition",
      );

    districtId = district.id;
    regionId = district.region?.id || null;

    // Règle : 60 / 20 / 20
    partDistrict = Math.round(montant * 0.6 * 100) / 100;
    partRegion = Math.round(montant * 0.2 * 100) / 100;
    partNationale =
      Math.round((montant - partDistrict - partRegion) * 100) / 100;
  } else {
    // Diaspora : tout va au national
    partNationale = montant;
  }

  return prisma.repartitionCotisation.create({
    data: {
      paiementId,
      montantTotal: new Decimal(montant),
      partDistrict: new Decimal(partDistrict),
      partRegion: new Decimal(partRegion),
      partNationale: new Decimal(partNationale),
      districtId,
      regionId,
    },
  });
};

// ================================================================
// WALLET COLLECTEUR
// ================================================================

// Obtenir ou créer le wallet d'un utilisateur
export const getOrCreateWallet = async (utilisateurId: string) => {
  return prisma.walletUtilisateur.upsert({
    where: { utilisateurId },
    update: {},
    create: {
      utilisateurId,
      solde: new Decimal(0),
    },
    include: {
      mouvements: {
        orderBy: { createdAt: "desc" },
        take: 20, // derniers 20 mouvements
      },
    },
  });
};

// Créditer le wallet d'un collecteur après un paiement
// Idempotent grâce à la référence unique
export const crediterWallet = async (
  utilisateurId: string,
  montant: number,
  reference: string,
  description: string,
) => {
  return prisma.$transaction(async (tx) => {
    // Obtenir ou créer le wallet (upsert ne crée pas de verrou de ligne)
    let wallet = await tx.walletUtilisateur.upsert({
      where: { utilisateurId },
      update: {},
      create: { utilisateurId, solde: new Decimal(0) },
    });

    // Anti-doublon : on s'appuie sur la contrainte @unique de reference
    // et on traite P2002 comme une opération idempotente
    try {
      await tx.mouvementWallet.create({
        data: {
          walletId: wallet.id,
          sens: "ENTREE",
          montant: new Decimal(montant),
          reference,
          description,
        },
      });
    } catch (err: any) {
      if (err?.code === "P2002") return wallet; // mouvement déjà appliqué, idempotent
      throw err;
    }

    // Recalculer le solde depuis les mouvements (plus fiable que l'incrément)
    const totaux = await tx.mouvementWallet.groupBy({
      by: ["sens"],
      where: { walletId: wallet.id },
      _sum: { montant: true },
    });

    const entrees =
      totaux.find((t) => t.sens === "ENTREE")?._sum.montant || new Decimal(0);
    const sorties =
      totaux.find((t) => t.sens === "SORTIE")?._sum.montant || new Decimal(0);
    const nouveauSolde = new Decimal(Number(entrees) - Number(sorties));

    return tx.walletUtilisateur.update({
      where: { id: wallet.id },
      data: { solde: nouveauSolde },
    });
  });
};

// ================================================================
// DASHBOARD FINANCIER — résumé global
// ================================================================
export const getDashboard = async () => {
  const [comptes, totalEntrees, totalSorties, repartitionsParDistrict] =
    await Promise.all([
      // Soldes de tous les comptes actifs
      prisma.compteFinancier.findMany({
        where: { actif: true },
        select: {
          id: true,
          nom: true,
          solde: true,
          membreId: true,
          districtId: true,
          paysId: true,
          district: { select: { name: true } },
          pays: { select: { name: true } },
        },
      }),

      // Total des entrées non annulées
      prisma.transactionFinanciere.aggregate({
        where: { type: "ENTREE", annule: false },
        _sum: { montant: true },
      }),

      // Total des sorties non annulées
      prisma.transactionFinanciere.aggregate({
        where: { type: "SORTIE", annule: false },
        _sum: { montant: true },
      }),

      // Répartitions par district (top 10)
      prisma.repartitionCotisation.groupBy({
        by: ["districtId"],
        where: { districtId: { not: null } },
        _sum: { partDistrict: true },
        orderBy: { _sum: { partDistrict: "desc" } },
        take: 10,
      }),
    ]);

  const soldeCentral = comptes
    .filter((c) => !c.membreId && !c.districtId && !c.paysId)
    .reduce((sum, c) => sum + Number(c.solde), 0);

  return {
    comptes,
    soldeCentral,
    totalEntrees: Number(totalEntrees._sum.montant || 0),
    totalSorties: Number(totalSorties._sum.montant || 0),
    soldeGlobal:
      Number(totalEntrees._sum.montant || 0) -
      Number(totalSorties._sum.montant || 0),
    repartitionsParDistrict,
  };
};
