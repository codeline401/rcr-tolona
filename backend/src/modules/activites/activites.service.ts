// src/modules/activites/activites.service.ts
// Logique métier du module activités.
// Gère : CRUD activités, étapes, postes budgétaires, contributions.

import prisma from "../../config/prisma";
import fs from "fs";
import path from "path";

// ================================================================
// ACTIVITÉS
// ================================================================

export const getActivites = async (params: {
  page?: number;
  limit?: number;
  finished?: boolean;
  canceled?: boolean;
  districtId?: string;
  search?: string;
  publique?: boolean; // pour le front public → seulement les activités publiques
}) => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.publique) where.publique = true;
  if (params.finished !== undefined) where.finished = params.finished;
  if (params.canceled !== undefined) where.canceled = params.canceled;
  if (params.districtId) where.districtId = params.districtId;
  if (params.search) {
    where.OR = [
      { titre: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
      { lieu: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const [total, activites] = await Promise.all([
    prisma.activite.count({ where }),
    prisma.activite.findMany({
      where,
      skip,
      take: limit,
      include: {
        responsable: { select: { id: true, nom: true, prenom: true } },
        district: { select: { id: true, name: true } },
        _count: {
          select: { etapes: true, contributions: true },
        },
      },
      orderBy: { dateDebut: "desc" },
    }),
  ]);

  return {
    data: activites,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getActiviteById = async (id: string) => {
  const activite = await prisma.activite.findUnique({
    where: { id },
    include: {
      responsable: {
        select: { id: true, nom: true, prenom: true, photo: true },
      },
      canceledBy: { select: { id: true, nom: true, prenom: true } },
      district: { select: { id: true, name: true } },
      etapes: { orderBy: { dateDebut: "asc" } },
      postesBudget: { orderBy: { createdAt: "asc" } },
      contributions: {
        where: { statut: "valide" },
        include: {
          contributeur: { select: { id: true, nom: true, prenom: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!activite) throw new Error("Activité introuvable");

  // Calculs financiers côté service (équivalent des @property Django)
  const totalContributions = activite.contributions.reduce(
    (sum, c) => sum + Number(c.montant),
    0,
  );
  const totalBudgetReel = activite.postesBudget.reduce(
    (sum, p) => sum + Number(p.montantReel || 0),
    0,
  );
  const objectifReel = Number(
    activite.objectifFinancement || activite.budgetPrevu,
  );
  const pourcentageFinancement =
    objectifReel > 0
      ? Math.round((totalContributions / objectifReel) * 100 * 100) / 100
      : 0;

  // Avancement par étapes
  const totalEtapes = activite.etapes.length;
  const etapesTerminees = activite.etapes.filter(
    (e) => e.statut === "termine",
  ).length;
  const avancement =
    totalEtapes > 0
      ? Math.round((etapesTerminees / totalEtapes) * 100 * 100) / 100
      : 0;

  return {
    ...activite,
    stats: {
      totalContributions,
      totalBudgetReel,
      budgetRestant: Number(activite.budgetPrevu) - totalBudgetReel,
      objectifReel,
      financementRestant: Math.max(objectifReel - totalContributions, 0),
      pourcentageFinancement,
      avancement,
      totalEtapes,
      etapesTerminees,
    },
  };
};

export const createActivite = async (data: any, illustrationPath?: string) => {
  return prisma.activite.create({
    data: {
      titre: data.titre,
      description: data.description || "",
      lieu: data.lieu,
      publique: data.publique ?? true,
      dateDebut: new Date(data.dateDebut),
      dateFin: new Date(data.dateFin),
      budgetPrevu: data.budgetPrevu ? parseFloat(data.budgetPrevu) : 0,
      objectifFinancement: data.objectifFinancement
        ? parseFloat(data.objectifFinancement)
        : null,
      responsableId: data.responsableId || null,
      districtId: data.districtId || null,
      illustration: illustrationPath || null,
    },
  });
};

export const updateActivite = async (
  id: string,
  data: any,
  newIllustration?: string,
) => {
  const activite = await prisma.activite.findUnique({ where: { id } });
  if (!activite) throw new Error("Activité introuvable");

  // Supprimer l'ancienne illustration si une nouvelle est fournie
  if (newIllustration && activite.illustration) {
    const oldPath = path.join(process.cwd(), "uploads", activite.illustration);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const updateData: any = {};
  const fields = [
    "titre",
    "description",
    "lieu",
    "publique",
    "budgetPrevu",
    "objectifFinancement",
    "responsableId",
    "districtId",
  ];
  for (const field of fields) {
    if (data[field] !== undefined) {
      if (["budgetPrevu", "objectifFinancement"].includes(field)) {
        updateData[field] =
          data[field] === null ? null : parseFloat(data[field]);
      } else {
        updateData[field] = data[field];
      }
    }
  }
  if (data.dateDebut) updateData.dateDebut = new Date(data.dateDebut);
  if (data.dateFin) updateData.dateFin = new Date(data.dateFin);
  if (newIllustration) updateData.illustration = newIllustration;

  return prisma.activite.update({ where: { id }, data: updateData });
};

export const deleteActivite = async (id: string) => {
  const activite = await prisma.activite.findUnique({ where: { id } });
  if (!activite) throw new Error("Activité introuvable");

  // Supprimer le fichier illustration si existant
  if (activite.illustration) {
    const filePath = path.join(process.cwd(), "uploads", activite.illustration);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  return prisma.activite.delete({ where: { id } });
};

// Terminer une activité
export const terminerActivite = async (id: string) => {
  const activite = await prisma.activite.findUnique({ where: { id } });
  if (!activite) throw new Error("Activité introuvable");
  if (activite.canceled) throw new Error("Cette activité est annulée");
  if (activite.finished) throw new Error("Cette activité est déjà terminée");

  return prisma.activite.update({ where: { id }, data: { finished: true } });
};

// Annuler une activité
export const annulerActivite = async (id: string, canceledById?: string) => {
  const activite = await prisma.activite.findUnique({ where: { id } });
  if (!activite) throw new Error("Activité introuvable");
  if (activite.finished) throw new Error("Cette activité est déjà terminée");
  if (activite.canceled) throw new Error("Cette activité est déjà annulée");

  return prisma.activite.update({
    where: { id },
    data: { canceled: true, canceledById: canceledById || null },
  });
};

// Stats globales
export const getStats = async () => {
  const [total, encours, terminees, annulees] = await Promise.all([
    prisma.activite.count(),
    prisma.activite.count({ where: { finished: false, canceled: false } }),
    prisma.activite.count({ where: { finished: true } }),
    prisma.activite.count({ where: { canceled: true } }),
  ]);

  const totalContributions = await prisma.contribution.aggregate({
    _sum: { montant: true },
    where: { statut: "valide" },
  });

  return {
    total,
    encours,
    terminees,
    annulees,
    totalContributionsValides: Number(totalContributions._sum.montant || 0),
  };
};

// ================================================================
// ÉTAPES
// ================================================================

export const getEtapes = async (activiteId: string) => {
  const activite = await prisma.activite.findUnique({
    where: { id: activiteId },
  });
  if (!activite) throw new Error("Activité introuvable");

  return prisma.etape.findMany({
    where: { activiteId },
    orderBy: { dateDebut: "asc" },
  });
};

export const createEtape = async (activiteId: string, data: any) => {
  const activite = await prisma.activite.findUnique({
    where: { id: activiteId },
  });
  if (!activite) throw new Error("Activité introuvable");

  // Vérifier que les dates de l'étape sont dans les bornes de l'activité
  const debut = new Date(data.dateDebut);
  const fin = new Date(data.dateFin);

  if (debut < activite.dateDebut) {
    throw new Error(
      "La date de début de l'étape ne peut pas être avant celle de l'activité",
    );
  }
  if (fin > activite.dateFin) {
    throw new Error(
      "La date de fin de l'étape ne peut pas être après celle de l'activité",
    );
  }

  return prisma.etape.create({
    data: {
      activiteId,
      nom: data.nom,
      description: data.description || "",
      dateDebut: debut,
      dateFin: fin,
      statut: data.statut || "non_demarre",
    },
  });
};

export const updateEtape = async (etapeId: string, data: any) => {
  const etape = await prisma.etape.findUnique({
    where: { id: etapeId },
    include: { activite: true },
  });
  if (!etape) throw new Error("Étape introuvable");

  const updateData: any = {};
  if (data.nom) updateData.nom = data.nom;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.statut) updateData.statut = data.statut;
  if (data.dateDebut) updateData.dateDebut = new Date(data.dateDebut);
  if (data.dateFin) updateData.dateFin = new Date(data.dateFin);

  return prisma.etape.update({ where: { id: etapeId }, data: updateData });
};

export const deleteEtape = async (etapeId: string) => {
  const etape = await prisma.etape.findUnique({ where: { id: etapeId } });
  if (!etape) throw new Error("Étape introuvable");
  return prisma.etape.delete({ where: { id: etapeId } });
};

// ================================================================
// POSTES BUDGÉTAIRES
// ================================================================

export const getPostesBudget = async (activiteId: string) => {
  return prisma.posteBudget.findMany({
    where: { activiteId },
    orderBy: { createdAt: "asc" },
  });
};

export const createPosteBudget = async (activiteId: string, data: any) => {
  const activite = await prisma.activite.findUnique({
    where: { id: activiteId },
  });
  if (!activite) throw new Error("Activité introuvable");

  return prisma.posteBudget.create({
    data: {
      activiteId,
      nomPoste: data.nomPoste,
      montantPrevu: parseFloat(data.montantPrevu),
      montantReel:
        data.montantReel != null ? parseFloat(data.montantReel) : null,
    },
  });
};

export const updatePosteBudget = async (posteId: string, data: any) => {
  const poste = await prisma.posteBudget.findUnique({ where: { id: posteId } });
  if (!poste) throw new Error("Poste budgétaire introuvable");

  const updateData: any = {};
  if (data.nomPoste) updateData.nomPoste = data.nomPoste;
  if (data.montantPrevu !== undefined)
    updateData.montantPrevu = parseFloat(data.montantPrevu);
  if (data.montantReel !== undefined)
    updateData.montantReel =
      data.montantReel != null ? parseFloat(data.montantReel) : null;

  return prisma.posteBudget.update({
    where: { id: posteId },
    data: updateData,
  });
};

export const deletePosteBudget = async (posteId: string) => {
  const poste = await prisma.posteBudget.findUnique({ where: { id: posteId } });
  if (!poste) throw new Error("Poste budgétaire introuvable");
  return prisma.posteBudget.delete({ where: { id: posteId } });
};

// ================================================================
// CONTRIBUTIONS
// ================================================================

export const getContributions = async (activiteId: string) => {
  const activite = await prisma.activite.findUnique({
    where: { id: activiteId },
  });
  if (!activite) throw new Error("Activité introuvable");

  return prisma.contribution.findMany({
    where: { activiteId },
    include: {
      contributeur: { select: { id: true, nom: true, prenom: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const createContribution = async (activiteId: string, data: any) => {
  const activite = await prisma.activite.findUnique({
    where: { id: activiteId },
  });
  if (!activite) throw new Error("Activité introuvable");
  if (activite.canceled)
    throw new Error("Impossible de contribuer à une activité annulée");

  // Il faut soit un contributeurId, soit un nomAnonyme
  if (!data.contributeurId && !data.nomAnonyme) {
    throw new Error("Fournir soit un contributeurId soit un nomAnonyme");
  }

  return prisma.contribution.create({
    data: {
      activiteId,
      contributeurId: data.contributeurId || null,
      nomAnonyme: data.nomAnonyme || null,
      emailAnonyme: data.emailAnonyme || null,
      montant: parseFloat(data.montant),
      referencePaiement: data.referencePaiement || null,
      statut: "en_attente", // toujours en attente à la création
    },
  });
};

export const updateStatutContribution = async (
  contributionId: string,
  statut: "valide" | "annule" | "rembourse",
) => {
  const contribution = await prisma.contribution.findUnique({
    where: { id: contributionId },
  });
  if (!contribution) throw new Error("Contribution introuvable");

  return prisma.contribution.update({
    where: { id: contributionId },
    data: { statut },
  });
};
