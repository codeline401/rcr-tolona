// src/modules/blog/blog.service.ts
// Logique métier du module blog.
// Gère : CRUD des articles, génération de slug, upload illustration.

import prisma from "../../config/prisma";
import fs from "fs";
import path from "path";

// ----------------------------------------------------------------
// Générer un slug unique à partir du titre
// Ex: "Mon Premier Article" → "mon-premier-article"
// Si le slug existe déjà, on ajoute un suffixe numérique : "-2", "-3"...
// ----------------------------------------------------------------
const generateSlug = async (
  title: string,
  excludeId?: string,
): Promise<string> => {
  // Convertir en minuscules, remplacer les espaces et caractères spéciaux
  let baseSlug = title
    .toLowerCase()
    .normalize("NFD") // décomposer les accents (é → e + combining)
    .replace(/[\u0300-\u036f]/g, "") // supprimer les diacritiques
    .replace(/[^a-z0-9\s-]/g, "") // ne garder que lettres, chiffres, espaces, tirets
    .trim()
    .replace(/\s+/g, "-") // remplacer les espaces par des tirets
    .replace(/-+/g, "-"); // éviter les tirets doubles

  let slug = baseSlug;
  let counter = 2;

  // Vérifier l'unicité et incrémenter si nécessaire
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug } });

    // Slug libre ou appartient déjà à cet article (cas de modification)
    if (!existing || existing.id === excludeId) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// ----------------------------------------------------------------
// Supprimer une illustration du disque
// ----------------------------------------------------------------
const deleteIllustration = (illustrationPath: string) => {
  if (!illustrationPath) return;

  // Extraire juste le nom du fichier depuis le chemin relatif
  const filename = path.basename(illustrationPath);
  const fullPath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "uploads",
    "illustrations",
    filename,
  );

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// ================================================================
// LISTE DES ARTICLES — avec pagination et filtres
// ================================================================
export const getPosts = async (params: {
  page?: number;
  limit?: number;
  status?: string; // "DF" | "PB" — si absent, retourne tout (admin)
  publicOnly?: boolean; // true = seulement les publiés (vue publique)
}) => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  // Vue publique : seulement les articles publiés et dont la date est passée
  if (params.publicOnly) {
    where.status = "PB";
    where.publish = { lte: new Date() }; // lte = less than or equal
  } else if (params.status) {
    where.status = params.status;
  }

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        illustration: true,
        status: true,
        publish: true,
        createdAt: true,
        // Infos auteur pour l'affichage dans la liste
        author: {
          select: {
            id: true,
            email: true,
            // Inclure le membre lié pour avoir le nom complet
            membre: { select: { nom: true, prenom: true, photo: true } },
          },
        },
      },
      orderBy: { publish: "desc" },
    }),
  ]);

  return {
    data: posts,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ================================================================
// DÉTAIL D'UN ARTICLE — par id ou par slug
// ================================================================
export const getPostById = async (id: string) => {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          membre: { select: { nom: true, prenom: true, photo: true } },
        },
      },
    },
  });
  if (!post) throw new Error("Article introuvable");
  return post;
};

export const getPostBySlug = async (slug: string, publicOnly = false) => {
  const where: any = { slug };

  // En vue publique, vérifier que l'article est bien publié
  if (publicOnly) {
    where.status = "PB";
    where.publish = { lte: new Date() };
  }

  const post = await prisma.post.findFirst({
    where,
    include: {
      author: {
        select: {
          id: true,
          email: true,
          membre: { select: { nom: true, prenom: true, photo: true } },
        },
      },
    },
  });

  if (!post) throw new Error("Article introuvable");
  return post;
};

// ================================================================
// CRÉER UN ARTICLE
// ================================================================
export const createPost = async (
  data: {
    title: string;
    body: string;
    excerpt?: string;
    status?: string;
    publish?: string;
  },
  authorId: string,
  illustration?: string, // chemin du fichier uploadé
) => {
  // Générer un slug unique à partir du titre
  const slug = await generateSlug(data.title);

  return prisma.post.create({
    data: {
      title: data.title,
      slug,
      body: data.body,
      excerpt: data.excerpt || "",
      illustration: illustration || null,
      status: data.status || "DF", // brouillon par défaut
      publish: data.publish ? new Date(data.publish) : new Date(),
      authorId,
    },
  });
};

// ================================================================
// MODIFIER UN ARTICLE
// ================================================================
export const updatePost = async (
  id: string,
  data: any,
  newIllustration?: string,
) => {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new Error("Article introuvable");

  // Si une nouvelle illustration est uploadée, supprimer l'ancienne
  if (newIllustration && post.illustration) {
    deleteIllustration(post.illustration);
  }

  // Régénérer le slug si le titre change
  let slug = post.slug;
  if (data.title && data.title !== post.title) {
    slug = await generateSlug(data.title, id); // exclure cet article du check
  }

  const updateData: any = { slug };
  const fields = ["title", "body", "excerpt", "status", "publish"];
  for (const field of fields) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }
  if (data.publish) updateData.publish = new Date(data.publish);
  if (newIllustration) updateData.illustration = newIllustration;

  return prisma.post.update({ where: { id }, data: updateData });
};

// ================================================================
// PUBLIER / DÉPUBLIER (raccourci)
// ================================================================
export const toggleStatus = async (id: string) => {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new Error("Article introuvable");

  const newStatus = post.status === "PB" ? "DF" : "PB";

  return prisma.post.update({
    where: { id },
    data: {
      status: newStatus,
      // Si on publie maintenant et que la date est dans le passé, mettre à jour
      publish:
        newStatus === "PB" && post.publish < new Date()
          ? new Date()
          : post.publish,
    },
  });
};

// ================================================================
// SUPPRIMER UN ARTICLE
// ================================================================
export const deletePost = async (id: string) => {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new Error("Article introuvable");

  // Supprimer l'illustration du disque si elle existe
  if (post.illustration) deleteIllustration(post.illustration);

  return prisma.post.delete({ where: { id } });
};

// ================================================================
// STATS — pour le dashboard admin
// ================================================================
export const getStats = async () => {
  const [total, publies, brouillons] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "PB" } }),
    prisma.post.count({ where: { status: "DF" } }),
  ]);

  // 5 articles les plus récents
  const recents = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, title: true, status: true, publish: true },
  });

  return { total, publies, brouillons, recents };
};
