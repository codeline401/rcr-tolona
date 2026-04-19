// src/modules/mada/ mada.service.ts
// Accès aux données géographiques de Mada
// Ces données sont principalement en lecture (importées depuis les fixtures Django)

import prisma from "../../config/prisma";

// -----------------------------------------------------------
// PROVINCES - niveau le plus haut
// -----------------------------------------------------------
export const getProvinces = async () => {
  return await prisma.province.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

// -----------------------------------------------------------
// REGIONS - avec leur province parente
// -----------------------------------------------------------
export const getRegions = async (provinceId?: string) => {
  return prisma.region.findMany({
    where: provinceId ? { provinceId } : undefined,
    include: {
      province: { select: { id: true, name: true } },
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
};

export const getRegionById = async (id: string) => {
  const region = await prisma.region.findUnique({
    where: { id },
    include: {
      province: true,
      districts: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!region) {
    throw new Error(`Region with id ${id} not found`);
  }
  return region;
};

// -----------------------------------------------------------
// DISSTRICTS - avec leur région parente
// -----------------------------------------------------------
export const getDistricts = async (regionId?: string) => {
  return prisma.district.findMany({
    where: regionId ? { regionId } : undefined,
    include: {
      region: { select: { id: true, name: true, code: true } },
    },
    orderBy: { name: "asc" },
  });
};

export const getDistrictById = async (id: string) => {
  const district = await prisma.district.findUnique({
    where: { id },
    include: {
      region: {
        include: { province: true },
      },
      communes: {
        orderBy: { name: "asc" },
      },
    },
  });

  if (!district) {
    throw new Error(`District with id ${id} not found`);
  }
};

// -----------------------------------------------------------
// COMMUNES - avec leur district parente
// -----------------------------------------------------------
export const getCommunes = async (districtId?: string) => {
  return prisma.commune.findMany({
    where: districtId ? { districtId } : undefined,
    include: {
      district: { select: { id: true, name: true, code: true } },
    },
    orderBy: { name: "asc" },
  });
};

// -----------------------------------------------------------
// FOKOTANY - avec leur commune parente
// -----------------------------------------------------------
export const getFokotany = async (communeId?: string) => {
  return prisma.fokontany.findMany({
    where: communeId ? { communeId } : undefined,
    include: {
      commune: { select: { id: true, name: true, code: true } },
    },
    orderBy: { name: "asc" },
  });
};

// -----------------------------------------------------------
// ARBRE COMPLET - Province avec toute sa hiérarchie
// utile pour construire des select en cascade sur le frontend
// -----------------------------------------------------------
export const getFullTree = async () => {
  return prisma.province.findMany({
    include: {
      regions: {
        orderBy: [{ order: "asc" }, { name: "asc" }],
        include: {
          districts: {
            where: { isValid: true }, // seulement les districts valides
            orderBy: { name: "asc" },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
};

// -----------------------------------------------------------
// RECHERCHE - chercher dans toutes la géographie
// -----------------------------------------------------------
export const search = async (query: string) => {
  const q = query.trim().toLowerCase(); // pour faire une recherche insensible à la casse et aux espaces

  const [regions, districts, communes] = await Promise.all([
    prisma.region.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      include: { province: { select: { name: true } } },
      take: 5, // limiter le nombre de résultats pour éviter les réponses trop lourdes
    }),
    prisma.district.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      include: { region: { select: { name: true } } },
      take: 5,
    }),
    prisma.commune.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      include: { district: { select: { name: true } } },
      take: 5,
    }),
  ]);

  return { regions, districts, communes };
};
