// src/modules/voting/voting.service.ts
// Logique métier complète du module voting.
// Gère : CRUD élections, choix, votes (auth + token), résultats, export CSV.

import prisma from "../../config/prisma";
import crypto from "crypto";
import { Prisma } from "@prisma/client";

// ----------------------------------------------------------------
// Typed error helper
// ----------------------------------------------------------------
const notFoundError = (message: string): Error => {
  const err = new Error(message);
  err.name = "NotFoundError";
  return err;
};

// ----------------------------------------------------------------
// Générer un slug unique pour une élection
// ----------------------------------------------------------------
const generateSlug = async (
  title: string,
  excludeId?: string,
): Promise<string> => {
  let baseSlug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  // Fallback for blank/special-char-only titles
  if (!baseSlug) baseSlug = "untitled";

  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await prisma.election.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// ================================================================
// ÉLECTIONS
// ================================================================

export const getElections = async (params: {
  page?: number;
  limit?: number;
  open?: boolean; // filtrer les élections en cours
}) => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;

  const now = new Date();
  const where: any = {};

  // Filtrer sur les élections actuellement ouvertes
  if (params.open === true) {
    where.startAt = { lte: now };
    where.endAt = { gte: now };
  } else if (params.open === false) {
    // Élections terminées
    where.endAt = { lt: now };
  }

  const [total, elections] = await Promise.all([
    prisma.election.count({ where }),
    prisma.election.findMany({
      where,
      skip,
      take: limit,
      include: {
        // Compter le nombre de choix et de votes
        _count: { select: { choices: true, votes: true, tokens: true } },
      },
      orderBy: { startAt: "desc" },
    }),
  ]);

  // Ajouter le statut calculé (ouvert / à venir / terminé)
  const electionsAvecStatut = elections.map((e) => ({
    ...e,
    statut: now < e.startAt ? "a_venir" : now > e.endAt ? "termine" : "ouvert",
  }));

  return {
    data: electionsAvecStatut,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getElectionById = async (id: string) => {
  const election = await prisma.election.findUnique({
    where: { id },
    include: {
      choices: {
        orderBy: { text: "asc" },
        include: { _count: { select: { votes: true } } },
      },
      _count: { select: { votes: true, tokens: true } },
    },
  });
  if (!election) throw notFoundError("Élection introuvable");

  const now = new Date();
  return {
    ...election,
    isOpen: now >= election.startAt && now <= election.endAt,
    statut:
      now < election.startAt
        ? "a_venir"
        : now > election.endAt
          ? "termine"
          : "ouvert",
  };
};

export const getElectionBySlug = async (slug: string) => {
  const election = await prisma.election.findUnique({
    where: { slug },
    include: {
      choices: { orderBy: { text: "asc" } },
      _count: { select: { votes: true } },
    },
  });
  if (!election) throw notFoundError("Élection introuvable");
  return election;
};

export const createElection = async (data: {
  title: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  public?: boolean;
  afficherResultats?: boolean;
}) => {
  if (data.startAt >= data.endAt) {
    throw new Error("startAt must be before endAt");
  }
  const slug = await generateSlug(data.title);

  return prisma.election.create({
    data: {
      title: data.title,
      slug,
      description: data.description || "",
      startAt: data.startAt,
      endAt: data.endAt,
      public: data.public ?? true,
      afficherResultats: data.afficherResultats ?? true,
    },
  });
};

export const updateElection = async (id: string, data: any) => {
  const election = await prisma.election.findUnique({ where: { id } });
  if (!election) throw notFoundError("Élection introuvable");

  // Régénérer le slug si le titre change
  let slug = election.slug;
  if (data.title && data.title !== election.title) {
    slug = await generateSlug(data.title, id);
  }

  const updateData: any = { slug };
  const fields = [
    "title",
    "description",
    "startAt",
    "endAt",
    "public",
    "afficherResultats",
  ];
  for (const field of fields) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }

  return prisma.election.update({ where: { id }, data: updateData });
};

export const deleteElection = async (id: string) => {
  const election = await prisma.election.findUnique({
    where: { id },
    include: { _count: { select: { votes: true } } },
  });
  if (!election) throw notFoundError("Élection introuvable");

  // Interdire la suppression si des votes existent déjà
  if (election._count.votes > 0) {
    throw new Error(
      `Impossible de supprimer : ${election._count.votes} vote(s) enregistré(s)`,
    );
  }

  return prisma.election.delete({ where: { id } });
};

// ================================================================
// CHOIX (candidats / options de vote)
// ================================================================

export const addChoice = async (
  electionId: string,
  data: { text: string; description?: string },
) => {
  // Vérifier que l'élection existe et n'a pas encore commencé
  const election = await prisma.election.findUnique({
    where: { id: electionId },
  });
  if (!election) throw notFoundError("Élection introuvable");

  if (new Date() >= election.startAt) {
  }

  return prisma.choice.create({
    data: {
      electionId,
      text: data.text,
      description: data.description || "",
    },
  });
};

export const updateChoice = async (
  id: string,
  data: { text?: string; description?: string },
) => {
  const choice = await prisma.choice.findUnique({
    where: { id },
    include: { election: true },
  });
  if (!choice) throw new Error("Choix introuvable");

  if (new Date() >= choice.election.startAt) {
    throw new Error("Impossible de modifier : l'élection a déjà commencé");
  }

  return prisma.choice.update({ where: { id }, data });
};

export const deleteChoice = async (id: string) => {
  const choice = await prisma.choice.findUnique({
    where: { id },
    include: {
      election: true,
      _count: { select: { votes: true } },
    },
  });
  if (!choice) throw new Error("Choix introuvable");

  if (choice._count.votes > 0) {
    throw new Error(
      "Impossible de supprimer : des votes existent pour ce choix",
    );
  }

  return prisma.choice.delete({ where: { id } });
};

// ================================================================
// VOTE — par utilisateur authentifié
// ================================================================
export const voterAuthentifie = async (
  electionId: string,
  choiceId: string,
  userId: string,
) => {
  const now = new Date();

  // 1. Vérifier que l'élection est ouverte
  const election = await prisma.election.findUnique({
    where: { id: electionId },
    include: { choices: { select: { id: true } } },
  });
  if (!election) throw notFoundError("Élection introuvable");
  if (now < election.startAt)
    throw new Error("L'élection n'a pas encore commencé");
  if (now > election.endAt) throw new Error("L'élection est terminée");

  // 2. Vérifier que le choix appartient à cette élection
  const choiceValide = election.choices.some((c) => c.id === choiceId);
  if (!choiceValide)
    throw new Error("Ce choix n'appartient pas à cette élection");

  // 3. Enregistrer le vote (unique constraint handles double-vote)
  try {
    return await prisma.vote.create({
      data: { electionId, choiceId, userId },
    });
  } catch (err: any) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      throw new Error("Vous avez déjà voté pour cette élection");
    }
    throw err;
  }
};

// ================================================================
// VOTE — par token anonyme (sans compte utilisateur)
// ================================================================
export const voterParToken = async (
  electionId: string,
  choiceId: string,
  tokenCode: string,
) => {
  const now = new Date();

  // 1. Vérifier l'élection
  const election = await prisma.election.findUnique({
    where: { id: electionId },
    include: { choices: { select: { id: true } } },
  });
  if (!election) throw notFoundError("Élection introuvable");
  if (now < election.startAt)
    throw new Error("L'élection n'a pas encore commencé");
  if (now > election.endAt) throw new Error("L'élection est terminée");

  // 2. Vérifier le choix
  const choiceValide = election.choices.some((c) => c.id === choiceId);
  if (!choiceValide)
    throw new Error("Ce choix n'appartient pas à cette élection");

  // 3. Tout en transaction : valider token, le marquer + enregistrer le vote atomiquement
  return prisma.$transaction(async (tx) => {
    // Lock + validate token inside transaction to prevent race conditions
    const voteToken = await tx.voteToken.findFirst({
      where: { code: tokenCode, electionId },
    });
    if (!voteToken) throw new Error("Token invalide ou introuvable");
    if (voteToken.used) throw new Error("Ce token a déjà été utilisé");

    // Marquer le token comme utilisé
    await tx.voteToken.update({
      where: { id: voteToken.id },
      data: { used: true },
    });

    // Enregistrer le vote avec le token comme identifiant
    return tx.vote.create({
      data: {
        electionId,
        choiceId,
        token: tokenCode, // stocker le token pour traçabilité
        userId: null, // vote anonyme
      },
    });
  });
};

// ================================================================
// RÉSULTATS D'UNE ÉLECTION
// ================================================================
export const getResultats = async (electionId: string) => {
  const election = await prisma.election.findUnique({
    where: { id: electionId },
    include: {
      choices: {
        include: {
          // Compter les votes pour chaque choix
          _count: { select: { votes: true } },
        },
        orderBy: { text: "asc" },
      },
    },
  });
  if (!election) throw new Error("Élection introuvable");

  const totalVotes = await prisma.vote.count({ where: { electionId } });

  // Calculer le pourcentage pour chaque choix
  const resultats = election.choices.map((choice) => ({
    id: choice.id,
    text: choice.text,
    description: choice.description,
    votes: choice._count.votes,
    pourcentage:
      totalVotes > 0
        ? Math.round((choice._count.votes / totalVotes) * 100 * 100) / 100
        : 0,
  }));

  // Trier par nombre de votes décroissant
  resultats.sort((a, b) => b.votes - a.votes);

  return {
    election: {
      id: election.id,
      title: election.title,
      slug: election.slug,
      startAt: election.startAt,
      endAt: election.endAt,
      isOpen:
        new Date() >= new Date(election.startAt) &&
        new Date() <= new Date(election.endAt),
      afficherResultats: election.afficherResultats,
    },
    totalVotes,
    resultats,
  };
};

// ================================================================
// STATUT DE VOTE D'UN UTILISATEUR
// Utile pour savoir si l'utilisateur connecté a déjà voté
// ================================================================
export const getStatutVote = async (electionId: string, userId: string) => {
  const vote = await prisma.vote.findFirst({
    where: { electionId, userId },
    include: { choice: { select: { id: true, text: true } } },
  });

  return {
    aVote: !!vote,
    choix: vote?.choice || null,
  };
};

// ================================================================
// TOKENS — génération en masse pour vote anonyme
// ================================================================
export const genererTokens = async (electionId: string, count: number) => {
  const election = await prisma.election.findUnique({
    where: { id: electionId },
  });
  if (!election) throw notFoundError("Élection introuvable");

  const tokens: { electionId: string; code: string; used: boolean }[] = [];

  // Guard: already limited by generateTokensValidation (max 500), but enforce here too
  const MAX_TOKENS_PER_REQUEST = 1000;
  if (!Number.isInteger(count) || count < 1 || count > MAX_TOKENS_PER_REQUEST) {
    throw new Error(
      `count must be a positive integer ≤ ${MAX_TOKENS_PER_REQUEST}`,
    );
  }

  // Generate tokens in batches to avoid large in-memory arrays
  const BATCH_SIZE = 100;
  let remaining = count;
  while (remaining > 0) {
    const batchSize = Math.min(remaining, BATCH_SIZE);
    const batch = Array.from({ length: batchSize }, () => ({
      electionId,
      code: crypto.randomUUID(),
      used: false,
    }));
    tokens.push(...batch);
    await prisma.voteToken.createMany({ data: batch });
    remaining -= batchSize;
  }

  return {
    count,
    tokens: tokens.map((t) => t.code),
  };
};

// Lister les tokens d'une élection (avec statut utilisé/non utilisé)
export const getTokens = async (electionId: string) => {
  const election = await prisma.election.findUnique({
    where: { id: electionId },
  });
  if (!election) throw notFoundError("Élection introuvable");

  const [tokens, stats] = await Promise.all([
    prisma.voteToken.findMany({
      where: { electionId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.voteToken.groupBy({
      by: ["used"],
      where: { electionId },
      _count: true,
    }),
  ]);

  const utilises = stats.find((s) => s.used === true)?._count || 0;
  const nonUtilises = stats.find((s) => s.used === false)?._count || 0;

  return { tokens, stats: { total: tokens.length, utilises, nonUtilises } };
};

// ================================================================
// LISTE DES ÉLECTEURS avec statut a_voté
// (reproduit la logique Django : filtres par config élection)
// ================================================================
export const getElecteurs = async (
  electionId: string,
  filtre: "tous" | "voted" | "not_voted" = "tous",
) => {
  const election = await prisma.election.findUnique({
    where: { id: electionId },
  });
  if (!election) throw new Error("Élection introuvable");

  // Récupérer la config pour savoir qui peut voter
  const config = await prisma.electionConfig.findFirst({
    orderBy: { createdAt: "desc" },
  });

  // Construire le filtre des membres éligibles
  const where: any = {
    membreActif: true,
    canVote: true,
  };

  if (config?.paysId) where.nationaliteId = config.paysId;
  if (config?.regionId) {
    where.adresse = {
      fokontany: {
        commune: { district: { regionId: config.regionId } },
      },
    };
  }

  // Récupérer tous les membres éligibles avec leur statut de vote
  const membres = await prisma.membre.findMany({
    where,
    select: {
      id: true,
      nom: true,
      prenom: true,
      registrationNumber: true,
      photo: true,
      adresse: {
        include: {
          fokontany: {
            include: { commune: { include: { district: true } } },
          },
        },
      },
      // Les votes de ce membre pour cette élection
      utilisateur: {
        select: {
          votes: {
            where: { electionId },
            select: { id: true, choice: { select: { text: true } } },
          },
        },
      },
    },
    orderBy: { nom: "asc" },
  });

  // Ajouter le champ aVote calculé (choixVote omis pour préserver le secret du vote)
  const membresAvecStatut = membres.map((m) => ({
    ...m,
    aVote: (m.utilisateur?.votes?.length || 0) > 0,
    district: m.adresse?.fokontany?.commune?.district?.name || null,
  }));

  // Appliquer le filtre
  const filtered =
    filtre === "voted"
      ? membresAvecStatut.filter((m) => m.aVote)
      : filtre === "not_voted"
        ? membresAvecStatut.filter((m) => !m.aVote)
        : membresAvecStatut;

  return {
    total: membres.length,
    totalOntVote: membresAvecStatut.filter((m) => m.aVote).length,
    totalNOntPasVote: membresAvecStatut.filter((m) => !m.aVote).length,
    membres: filtered,
  };
};

// ================================================================
// EXPORT CSV des électeurs (reproduit la vue Django)
// ================================================================
export const exportElecteursCSV = async (
  electionId: string,
  filtre: "tous" | "voted" | "not_voted",
) => {
  const electeurs = await getElecteurs(electionId, filtre);

  // Construire le CSV manuellement (pas de dépendance externe)
  // Note: BOM UTF-8 est ajouté par le contrôleur
  const lignes = [
    ["Nom", "Prénom", "Matricule", "District", "A voté"].join(","),
    ...electeurs.membres.map((m) =>
      [
        m.nom,
        m.prenom || "",
        m.registrationNumber || "",
        m.district || "",
        m.aVote ? "Oui" : "Non",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    ),
  ];

  return lignes.join("\n");
};

// ================================================================
// ELECTION CONFIG — qui peut voter
// ================================================================
export const getConfig = async () => {
  return prisma.electionConfig.findFirst({
    orderBy: { createdAt: "desc" },
    include: {
      pays: { select: { id: true, name: true } },
      region: { select: { id: true, name: true } },
    },
  });
};

export const upsertConfig = async (data: {
  paysId?: string;
  regionId?: string;
  dateLimite?: string;
}) => {
  const existing = await prisma.electionConfig.findFirst();

  if (existing) {
    return prisma.electionConfig.update({
      where: { id: existing.id },
      data: {
        paysId: data.paysId || null,
        regionId: data.regionId || null,
        dateLimite: data.dateLimite ? new Date(data.dateLimite) : undefined,
      },
    });
  }

  return prisma.electionConfig.create({
    data: {
      paysId: data.paysId || null,
      regionId: data.regionId || null,
      dateLimite: data.dateLimite ? new Date(data.dateLimite) : undefined,
    },
  });
};
