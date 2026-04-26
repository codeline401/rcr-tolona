// src/modules/membre/membre.service.ts
// Logique métier complète du module membre
// Contient : CRUD, génération de matricule, gestion de validité, exclusion.

import prisma from "../../config/prisma";
import fs from "fs"; // pour gérer les fichiers (suppression de photos)
import path from "path"; // pour gérer les chemins de fichiers
import { stringify } from "querystring";

// ---------------------------------------------------------------------------
// ALGO GENERATION DU CODE ALPHANUMERIQUE (traduit depuis python)
// Utilisé pour construire la partie "division" du matricule
//
// Plages :
// 1 à 99  -> "01" à "99"
// 100 à 349 -> "A0" à "Z9"
// 350 à 574 -> "1A" à "9Z"
// 575 à 1199 - > "AA" à "ZZ"
// ---------------------------------------------------------------------------
const ALPHABET = "ABCDEFGHIJKLMNPQRSTUVWXYZ"; // pas de O pour éviter les confusions avec le 0

const generateDivisonCode = (num: number): string => {
  if (num < 1 || num >= 1200) {
    throw new Error(
      `Division number must be between 1 and 1199. Received: ${num}`,
    );
  }

  // Phase 1 : 1 à 99 -> "01" à "99"
  if (num >= 1 && num <= 99) {
    return num.toString().padStart(2, "0"); // ajoute un zéro devant si nécessaire
  }

  // Phase 2 : 100 à 349 -> "A0" à "Z9"
  if (num >= 100 && num <= 349) {
    const offset = num - 100; // 0 à 249
    return `${ALPHABET[Math.floor(offset / 10)]}${offset % 10}`; // lettre + chiffre
  }

  // Phase 3 : 350 à 574 -> "1A" à "9Z"
  if (num >= 350 && num <= 574) {
    const offset = num - 350; // 0 à 224
    return `${Math.floor(offset / ALPHABET.length) + 1}${ALPHABET[offset % ALPHABET.length]}`; // chiffre + lettre
  }

  // Phase 4 : 575 à 1199 -> "AA" à "ZZ"
  const offset = num - 575; // 0 à 624
  return `${ALPHABET[Math.floor(offset / ALPHABET.length)]}${ALPHABET[offset % ALPHABET.length]}`; // lettre + lettre
};

// ---------------------------------------------------------------------------
// GENERER LE MATRICULE COMPLET
// Format : [codeRegion][codeDistrict][codeDivision]
// Exemple : "01A0" pour un membre de la région 1, district 1, division 100
// ---------------------------------------------------------------------------
const generateRegistrationNumber = async (
  codeRegion: string,
  codeDistrict: string,
): Promise<{
  registrationNumber: string;
  divisionNumber: number;
  codeDivision: string;
}> => {
  // Compter combien de membres existent déjà dans cette région + district
  // pour déterminer le prochain numéro de division à attribuer
  const count = await prisma.membre.count({
    where: {
      codeRegion,
      codeDistrict,
      registrationNumber: { not: null }, // on ne compte que les membres qui ont déjà un matricule (exclut les membres en cours de création)
    },
  });

  const divisionNumber = count + 1; // le prochain numéro de division à attribuer
  const codeDivision = generateDivisonCode(divisionNumber); // générer le code de division à partir du numéro de division
  const registrationNumber = `${codeRegion}${codeDistrict}${codeDivision}`; // construire le matricule complet

  return { registrationNumber, divisionNumber, codeDivision };
};

// ---------------------------------------------------------------------------
// Liste des membres avec pagination, tri et filtrage
// ---------------------------------------------------------------------------
export const getMembres = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  statut?: number;
  validityStatus?: number;
  districtId?: string;
  isExcluded?: boolean;
}) => {
  const page = params.page || 1; // page actuelle (par défaut 1)
  const limit = params.limit || 20; // nombre de membres par page
  const skip = (page - 1) * limit; //

  // Construire les filtres dynamiquement
  const where: any = {};

  if (params.search) {
    // Recherche sur nom, prénom, CIN, ou numéro de matricule
    where.OR = [
      { nom: { contains: params.search, mode: "insensitive" } },
      { prenom: { contains: params.search, mode: "insensitive" } },
      { cin: { contains: params.search, mode: "insensitive" } },
      { registrationNumber: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (params.statut) where.statut = params.statut;
  if (params.validityStatus !== undefined)
    where.validityStatus = params.validityStatus;
  if (params.isExcluded !== undefined) where.isExcluded = params.isExcluded;

  // Filtrer par district via la relation adresse
  if (params.districtId) {
    where.adresse = {
      fokontany: { commune: { districtId: params.districtId } },
    };
  }

  // Exécuter count et findMany en parallèle pour la performance
  const [total, membres] = await Promise.all([
    prisma.membre.count({ where }),
    prisma.membre.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        nom: true,
        prenom: true,
        sexe: true,
        dateNaissance: true,
        cin: true,
        telephone: true,
        photo: true,
        statut: true,
        membreActif: true,
        validityStatus: true,
        isExcluded: true,
        registrationNumber: true,
        createdAt: true,
        // Inclure nationalité et adresse pour affichage dans la liste
        nationalite: { select: { id: true, name: true } },
        adresse: {
          include: {
            fokontany: {
              include: {
                commune: {
                  include: { district: { select: { id: true, name: true } } },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    data: membres,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ---------------------------------------------------------------------------
// FICHE détaillée d'un membre
// ---------------------------------------------------------------------------
export const getMemberById = async (id: string) => {
  const member = await prisma.membre.findUnique({
    where: { id },
    include: {
      nationalite: true,
      adresse: {
        include: {
          fokontany: {
            include: {
              commune: {
                include: {
                  district: {
                    include: {
                      region: { include: { province: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
      utilisateur: { select: { id: true, email: true } },
      createdBy: { select: { id: true, email: true } },
      treatedBy: { select: { id: true, email: true } },
      cotisations: {
        include: {
          campagne: true,
          typeCotisation: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!member) throw new Error("Membre non trouvé.");
  return member;
};

// ---------------------------------------------------------------------------
// CREER UN NOUVEAU MEMBRE
// ---------------------------------------------------------------------------
export const createMembre = async (
  data: any,
  photo?: string, // chemin de la photo uploadée (si fournie)
  createdById?: string, // ID de l'utilisateur qui crée le membre (si disponible)
) => {
  // Vérifier que le CIN n'est pas déjà utilisé
  const existing = await prisma.membre.findUnique({
    where: { cin: data.cin },
  });
  if (existing) throw new Error("CIN déjà utilisé.");

  const membre = await prisma.membre.create({
    data: {
      nom: data.nom.toUpperCase(), // stocker le nom en majuscules pour uniformité
      prenom: data.prenom,
      sexe: data.sexe,
      dateNaissance: new Date(data.dateNaissance),
      cin: data.cin,
      passeport: data.passeport || null,
      nationaliteId: data.nationaliteId || null,
      adresseId: data.adresseId || null,
      adresseEtranger: data.adresseEtranger || null,
      telephone: data.telephone,
      email: data.email || null,
      formationRcr: data.formationRcr || false,
      anneeDecouverte: data.anneeDecouverte,
      canalDecouverte: data.canalDecouverte,
      motivation: data.motivation,
      attentes: data.attentes || null,
      niveauEtude: data.niveauEtude || null,
      metier: data.metier || null,
      secteurActivite: data.secteurActivite || null,
      engagement: data.engagement || null,
      membreActif: true, // par défaut un nouveau membre est actif
      partageContacts: data.partageContacts || false,
      statut: "actif", // par défaut un nouveau membre est actif
      photo: photo || null,
      validityStatus: 0, // 0 = en attente de validation
      createdById: createdById || null,
    },
  });

  return membre;
};

// ---------------------------------------------------------------------------
// MODIFIER UN MEMBRE - (PATCH - mise à jour partielle)
// ---------------------------------------------------------------------------
export const updateMembre = async (
  id: string,
  data: any,
  newPhoto?: string,
) => {
  // Vérifier que le membre existe
  const membre = await prisma.membre.findUnique({
    where: { id },
  });
  if (!membre) throw new Error("Membre non trouvé.");

  // Si le CIN est modifié, vérifier l'unicité
  if (data.cin && data.cin !== membre.cin) {
    const existingCin = await prisma.membre.findUnique({
      where: { cin: data.cin },
    });
    if (existingCin) throw new Error("CIN déjà utilisé par un autre membre.");
  }

  // Si une nouvelle photo est fournie, supprimer l'ancienne
  if (newPhoto && membre.photo) {
    const oldPhotoPath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "uploads",
      "membres",
      path.basename(membre.photo),
    );
    if (fs.existsSync(oldPhotoPath)) {
      fs.unlinkSync(oldPhotoPath); // supprimer l'ancienne photo du serveur
    }
  }

  // Construire l'objet de mise à jour (seulement les champs fournis)
  const updateData: any = {};
  const fields = [
    "nom",
    "prenom",
    "sexe",
    "dateNaissance",
    "cin",
    "passeport",
    "nationaliteId",
    "adresseId",
    "adresseEtranger",
    "telephone",
    "email",
    "formationRcr",
    "anneeDecouverte",
    "canalDecouverte",
    "motivation",
    "attentes",
    "niveauEtude",
    "metier",
    "secteurActivite",
    "engagement",
    "membreActif",
    "partageContacts",
    "statut",
    "canVote",
  ];

  for (const field of fields) {
    // ne mettre à jour que les champs qui sont présents dans la requête
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  if (data.nom) updateData.nom = data.nom.toUpperCase();
  if (newPhoto) updateData.photo = newPhoto;

  return prisma.membre.update({ where: { id }, data: updateData });
};

// ---------------------------------------------------------------------------
// SUPPRIMER UN MEMBRE
// ---------------------------------------------------------------------------
export const deleteMembre = async (id: string) => {
  const membre = await prisma.membre.findUnique({
    where: { id },
  });
  if (!membre) throw new Error("Membre non trouvé.");

  // Supprimer la photo du serveur si elle existe
  if (membre.photo) {
    const photoPath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "uploads",
      "membres",
      path.basename(membre.photo),
    );
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath); // supprimer la photo du serveur
    }
  }

  await prisma.membre.delete({
    where: { id },
  });
};

// ---------------------------------------------------------------------------
// VALIDER / REJETER UN MEMBRE (après vérification des documents)
// validityStatus : 1 = en attente, 2 = validé, 3 = rejeté
// ---------------------------------------------------------------------------
export const updateValidityStatus = async (
  id: string,
  validityStatus: number,
  comment: string,
  treatedById?: string,
) => {
  const membre = await prisma.membre.findUnique({
    where: { id },
  });
  if (!membre) throw new Error("Membre non trouvé.");

  // Ajouter le commentaire dan l'historique
  const history = (membre.validityHistoryComment as any[]) || [];
  history.push({
    status: validityStatus,
    comment,
    date: new Date().toDateString(),
    treatedById: treatedById,
  });

  // Si approuvée (status 2) et pas encore de matricule, générer le matricule
  let matriculeData = {};
  if (
    validityStatus === 2 &&
    !membre.registrationNumber &&
    membre.codeRegion &&
    membre.codeDistrict
  ) {
    const { registrationNumber, divisionNumber, codeDivision } =
      await generateRegistrationNumber(membre.codeRegion, membre.codeDistrict);
    matriculeData = {
      registrationNumber,
      codeDivision,
      divisionNumber,
      dateRegistration: new Date(),
    };
  }

  return prisma.membre.update({
    where: { id },
    data: {
      validityStatus,
      validityLastComment: comment,
      validityHistoryComment: history,
      treatedById,
      treatedAt: new Date(),
      ...matriculeData, // inclure les données de matricule si générées
    },
  });
};

// ---------------------------------------------------------------------------
// EXCLURE / (REINTEGRER) UN MEMBRE
// ---------------------------------------------------------------------------
export const exclureMembre = async (
  id: string,
  excludeById: string,
  reason: string,
) => {
  const membre = await prisma.membre.findUnique({
    where: { id },
  });
  if (!membre) throw new Error("Membre non trouvé.");
  if (membre.isExcluded) throw new Error("Membre déjà exclu.");

  return prisma.membre.update({
    where: { id },
    data: {
      isExcluded: true,
      exclusionReason: reason,
      exclusionDate: new Date(),
      excludedById: excludeById,
    },
  });
};

// ---------------------------------------------------------------------------
// STATISTIQUE POUR LE DASHBOARD
// ---------------------------------------------------------------------------
export const getStats = async () => {
  const [total, actifs, enAttente, exclus] = await Promise.all([
    prisma.membre.count(), // total de membres
    prisma.membre.count({ where: { statut: "actif", isExcluded: false } }), // membres actifs
    prisma.membre.count({ where: { validityStatus: 1, isExcluded: false } }), // membres en attente de validation
    prisma.membre.count({ where: { isExcluded: true } }), // membres exclus
  ]);

  return {
    total,
    actifs,
    enAttente,
    exclus,
  };
};
