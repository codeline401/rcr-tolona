// src/modules/cotisation/cotisation.service.ts
// Logique métier complète du module cotisation :
// Campagnes, Types, Cotisations, Tranches et Paiements.

import { Prisma } from "../../generated/prisma/client";
import prisma from "../../config/prisma";

const Decimal = Prisma.Decimal;

// ================================================================
// CAMPAGNES
// ================================================================

// Lister toutes les campagnes, les plus récentes en premier
export const getCampagnes = async () => {
  return prisma.campagneCotisation.findMany({
    orderBy: { annee: "desc" },
    include: {
      // Compter le nombre de cotisations dans chaque campagne
      _count: { select: { cotisations: true } },
    },
  });
};

export const getCampagneById = async (id: string) => {
  const campagne = await prisma.campagneCotisation.findUnique({
    where: { id },
    include: { _count: { select: { cotisations: true } } },
  });
  if (!campagne) throw new Error("Campagne introuvable");
  return campagne;
};

export const createCampagne = async (data: {
  name: string;
  annee: number;
  dateDebut?: string;
  dateFin?: string;
  active?: boolean;
}) => {
  // Vérifier l'unicité du nom
  const existing = await prisma.campagneCotisation.findUnique({
    where: { name: data.name },
  });
  if (existing) throw new Error("Une campagne avec ce nom existe déjà");

  return prisma.campagneCotisation.create({
    data: {
      name: data.name,
      annee: data.annee,
      dateDebut: data.dateDebut ? new Date(data.dateDebut) : new Date(),
      dateFin: data.dateFin ? new Date(data.dateFin) : null,
      active: data.active ?? true,
    },
  });
};

export const updateCampagne = async (id: string, data: any) => {
  const campagne = await prisma.campagneCotisation.findUnique({
    where: { id },
  });
  if (!campagne) throw new Error("Campagne introuvable");
  return prisma.campagneCotisation.update({ where: { id }, data });
};

export const deleteCampagne = async (id: string) => {
  const campagne = await prisma.campagneCotisation.findUnique({
    where: { id },
    include: { _count: { select: { cotisations: true } } },
  });
  if (!campagne) throw new Error("Campagne introuvable");

  // Interdire la suppression si des cotisations y sont liées
  if (campagne._count.cotisations > 0) {
    throw new Error(
      `Impossible de supprimer : ${campagne._count.cotisations} cotisation(s) liée(s)`,
    );
  }

  return prisma.campagneCotisation.delete({ where: { id } });
};

// ================================================================
// TYPES DE COTISATION
// ================================================================

export const getTypesCotisation = async (actifSeulement = false) => {
  return prisma.typeCotisation.findMany({
    where: actifSeulement ? { actif: true } : undefined,
    orderBy: { name: "asc" },
  });
};

export const createTypeCotisation = async (data: any) => {
  const existing = await prisma.typeCotisation.findUnique({
    where: { name: data.name },
  });
  if (existing) throw new Error("Un type avec ce nom existe déjà");

  return prisma.typeCotisation.create({
    data: {
      name: data.name,
      description: data.description || null,
      montantFixe: data.montantFixe ? new Decimal(data.montantFixe) : null,
      nombreTranche: data.nombreTranche || 1,
      obligatoire: data.obligatoire ?? true,
      actif: data.actif ?? true,
      isNewVersion: data.isNewVersion ?? false,
    },
  });
};

export const updateTypeCotisation = async (id: string, data: any) => {
  const type = await prisma.typeCotisation.findUnique({ where: { id } });
  if (!type) throw new Error("Type de cotisation introuvable");
  return prisma.typeCotisation.update({ where: { id }, data });
};

// ================================================================
// COTISATIONS
// ================================================================

// Liste paginée avec filtres
export const getCotisations = async (params: {
  page?: number;
  limit?: number;
  campagneId?: string;
  membreId?: string;
  payee?: boolean;
}) => {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.campagneId) where.campagneId = params.campagneId;
  if (params.membreId) where.membreId = params.membreId;

  // Filtrer par statut payée/non payée en regardant les paiements
  // (calculé côté service après fetch car Prisma ne supporte pas
  // facilement les agrégats dans where)

  const cotisations = await prisma.cotisation.findMany({
    where,
      include: {
        membre: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            registrationNumber: true,
          },
        },
        typeCotisation: { select: { id: true, name: true, montantFixe: true } },
        campagne: { select: { id: true, name: true, annee: true } },
        // Inclure le total des paiements validés pour chaque cotisation
        paiements: {
          where: { estValide: true },
          select: { montant: true },
        },
        _count: { select: { tranches: true, paiements: true } },
      },
    orderBy: { createdAt: "desc" },
  });

  // Calculer le montant payé et le statut pour chaque cotisation
  const cotisationsAvecStatut = cotisations.map((c) => {
    const montantPaye = c.paiements.reduce(
      (sum, p) => sum + Number(p.montant),
      0,
    );
    const estPayee = montantPaye >= Number(c.montantTotal);
    const resteAPayer = Number(c.montantTotal) - montantPaye;

    return {
      ...c,
      montantPaye,
      estPayee,
      resteAPayer: resteAPayer < 0 ? 0 : resteAPayer,
    };
  });

  // Appliquer le filtre "payée" si demandé
  const filtered =
    params.payee !== undefined
      ? cotisationsAvecStatut.filter((c) => c.estPayee === params.payee)
      : cotisationsAvecStatut;

  const total = filtered.length;
  return {
    data: filtered.slice(skip, skip + limit),
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// Détail d'une cotisation avec toutes ses tranches et paiements
export const getCotisationById = async (id: string) => {
  const cotisation = await prisma.cotisation.findUnique({
    where: { id },
    include: {
      membre: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          cin: true,
          registrationNumber: true,
          photo: true,
        },
      },
      typeCotisation: true,
      campagne: true,
      tranches: {
        orderBy: { numero: "asc" },
        include: {
          paiements: {
            where: { estValide: true },
            orderBy: { datePaiement: "desc" },
          },
        },
      },
      paiements: {
        orderBy: { datePaiement: "desc" },
        include: {
          enregistrePar: { select: { id: true, email: true } },
        },
      },
    },
  });

  if (!cotisation) throw new Error("Cotisation introuvable");

  // Calculer le montant payé total
  const montantPaye = cotisation.paiements
    .filter((p) => p.estValide)
    .reduce((sum, p) => sum + Number(p.montant), 0);

  return {
    ...cotisation,
    montantPaye,
    estPayee: montantPaye >= Number(cotisation.montantTotal),
    resteAPayer: Math.max(0, Number(cotisation.montantTotal) - montantPaye),
  };
};

// Créer une cotisation et générer automatiquement ses tranches
export const createCotisation = async (
  data: {
    membreId: string;
    typeCotisationId: string;
    campagneId: string;
    montantTotal?: number;
  },
  createdById?: string,
) => {
  // Vérifier que le membre n'a pas déjà cette cotisation pour cette campagne
  const existing = await prisma.cotisation.findFirst({
    where: {
      membreId: data.membreId,
      typeCotisationId: data.typeCotisationId,
      campagneId: data.campagneId,
    },
  });
  if (existing)
    throw new Error("Ce membre a déjà cette cotisation pour cette campagne");

  // Récupérer le type pour connaître le montant et le nombre de tranches
  const type = await prisma.typeCotisation.findUnique({
    where: { id: data.typeCotisationId },
  });
  if (!type) throw new Error("Type de cotisation introuvable");

  const campagne = await prisma.campagneCotisation.findUnique({
    where: { id: data.campagneId },
  });
  if (!campagne) throw new Error("Campagne introuvable");

  // Utiliser le montant fourni ou le montant fixe du type
  const montantTotal = data.montantTotal
    ? new Decimal(data.montantTotal)
    : type.montantFixe || new Decimal(0);

  // Tout faire dans une transaction : créer la cotisation + les tranches
  return prisma.$transaction(async (tx) => {
    // 1. Créer la cotisation
    const cotisation = await tx.cotisation.create({
      data: {
        membreId: data.membreId,
        typeCotisationId: data.typeCotisationId,
        campagneId: data.campagneId,
        montantTotal,
      },
    });

    // 2. Générer les tranches automatiquement
    const nbTranches = type.nombreTranche;

    // Répartition en centimes pour éviter la dérive des arrondis flottants
    const totalCents = Math.round(Number(montantTotal) * 100);
    const baseCents = Math.floor(totalCents / nbTranches);
    const remainder = totalCents % nbTranches;

    // Distribution des mois sur l'année complète (jusqu'à 12 tranches distinctes)
    const tranches = Array.from({ length: nbTranches }, (_, i) => {
      const month = Math.floor((i * 12) / nbTranches) + 1;
      const dateEcheance = new Date(campagne.annee, month - 1, 28);
      const amountCents = baseCents + (i < remainder ? 1 : 0);

      return {
        cotisationId: cotisation.id,
        numero: i + 1,
        montant: new Decimal((amountCents / 100).toFixed(2)),
        dateEcheance,
        payee: false,
      };
    });

    await tx.trancheCotisation.createMany({ data: tranches });

    return cotisation;
  });
};

export const deleteCotisation = async (id: string) => {
  const cotisation = await prisma.cotisation.findUnique({
    where: { id },
    include: { _count: { select: { paiements: true } } },
  });
  if (!cotisation) throw new Error("Cotisation introuvable");

  if (cotisation._count.paiements > 0) {
    throw new Error(
      `Impossible de supprimer : ${cotisation._count.paiements} paiement(s) enregistré(s)`,
    );
  }

  return prisma.cotisation.delete({ where: { id } });
};

// ================================================================
// PAIEMENTS
// ================================================================

// Enregistrer un paiement sur une cotisation
export const createPaiement = async (
  cotisationId: string,
  data: {
    montant: number;
    moyenPaiement?: string;
    datePaiement?: string;
    trancheId?: string;
    reference?: string;
  },
  enregistreParId: string,
) => {
  // Tout faire dans une transaction : vérifications + paiement + mise à jour tranche
  return prisma.$transaction(async (tx) => {
    // Re-fetch dans la transaction pour prévenir les races concurrentes
    const cotisation = await tx.cotisation.findUnique({
      where: { id: cotisationId },
      include: {
        paiements: { where: { estValide: true }, select: { montant: true } },
      },
    });
    if (!cotisation) throw new Error("Cotisation introuvable");

    // Calculer le montant déjà payé
    const dejasPaye = cotisation.paiements.reduce(
      (sum, p) => sum + Number(p.montant),
      0,
    );
    const resteAPayer = Number(cotisation.montantTotal) - dejasPaye;

    // Vérifier que le paiement ne dépasse pas le reste à payer
    if (data.montant > resteAPayer + 0.01) {
      throw new Error(
        `Montant trop élevé. Reste à payer : ${resteAPayer.toFixed(2)} Ar`,
      );
    }

    // Si une tranche est spécifiée, vérifier qu'elle appartient à cette cotisation
    if (data.trancheId) {
      const tranche = await tx.trancheCotisation.findUnique({
        where: { id: data.trancheId },
      });
      if (!tranche || tranche.cotisationId !== cotisationId) {
        throw new Error("Cette tranche ne correspond pas à cette cotisation");
      }
    }

    // 1. Créer le paiement
    const paiement = await tx.paiementCotisation.create({
      data: {
        cotisationId,
        trancheId: data.trancheId || null,
        montant: new Decimal(data.montant),
        moyenPaiement: data.moyenPaiement || "ESPECES",
        datePaiement: data.datePaiement
          ? new Date(data.datePaiement)
          : new Date(),
        reference: data.reference || null,
        estValide: true,
        enregistreParId,
      },
    });

    // 2. Si une tranche est liée, recalculer son statut "payée"
    if (data.trancheId) {
      const totalPaiementsTranche = await tx.paiementCotisation.aggregate({
        where: { trancheId: data.trancheId, estValide: true },
        _sum: { montant: true },
      });

      const tranche = await tx.trancheCotisation.findUnique({
        where: { id: data.trancheId },
      });

      const totalPaye = Number(totalPaiementsTranche._sum.montant || 0);
      const estPayee = totalPaye >= Number(tranche?.montant || 0);

      await tx.trancheCotisation.update({
        where: { id: data.trancheId },
        data: { payee: estPayee },
      });
    }

    return paiement;
  });
};

// Invalider un paiement (annulation)
export const invaliderPaiement = async (paiementId: string) => {
  const paiement = await prisma.paiementCotisation.findUnique({
    where: { id: paiementId },
  });
  if (!paiement) throw new Error("Paiement introuvable");
  if (!paiement.estValide) throw new Error("Ce paiement est déjà invalidé");

  return prisma.$transaction(async (tx) => {
    // 1. Invalider le paiement
    await tx.paiementCotisation.update({
      where: { id: paiementId },
      data: { estValide: false },
    });

    // 2. Recalculer le statut payée de la tranche selon les paiements valides restants
    if (paiement.trancheId) {
      const tranche = await tx.trancheCotisation.findUnique({
        where: { id: paiement.trancheId },
      });
      const sumRestant = await tx.paiementCotisation.aggregate({
        where: { trancheId: paiement.trancheId, estValide: true },
        _sum: { montant: true },
      });
      const totalRestant = Number(sumRestant._sum.montant || 0);
      await tx.trancheCotisation.update({
        where: { id: paiement.trancheId },
        data: { payee: totalRestant >= Number(tranche?.montant || 0) },
      });
    }

    return { message: "Paiement invalidé" };
  });
};

// ================================================================
// STATISTIQUES pour le dashboard
// ================================================================
export const getStats = async (campagneId?: string) => {
  const where = campagneId ? { campagneId } : {};

  const [totalCotisations, paiementsValides, campagneActive] =
    await Promise.all([
      prisma.cotisation.count({ where }),

      // Total des montants payés
      prisma.paiementCotisation.aggregate({
        where: { estValide: true, cotisation: where },
        _sum: { montant: true },
      }),

      // Campagne active en cours
      prisma.campagneCotisation.findFirst({
        where: { active: true },
        orderBy: { annee: "desc" },
      }),
    ]);

  return {
    totalCotisations,
    totalPercu: Number(paiementsValides._sum.montant || 0),
    campagneActive,
  };
};
