// src/modules/blog/blog.controller.ts

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { AuthRequest } from "../../middlewares/auth.middleware";
import { success, error } from "../../utils/response";
import * as blogService from "./blog.service";

// ----------------------------------------------------------------
// GET /api/blog          → liste admin (tous statuts)
// GET /api/blog/public   → liste publique (publiés seulement)
// ----------------------------------------------------------------
export const getPosts = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Paramètres invalides", 400, errors.array());

  try {
    const rawStatus = req.query.status;
    const statusRaw = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;
    const status =
      typeof statusRaw === "string" && statusRaw.trim()
        ? statusRaw.trim()
        : undefined;
    const result = await blogService.getPosts({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      status,
      publicOnly: false, // route admin : tous les articles
    });
    return success(res, result);
  } catch (err: any) {
    return error(res, err.message);
  }
};

export const getPublicPosts = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Paramètres invalides", 400, errors.array());

  try {
    const result = await blogService.getPosts({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
      publicOnly: true, // seulement les publiés
    });
    return success(res, result);
  } catch (err: any) {
    return error(res, err.message);
  }
};

// ----------------------------------------------------------------
// GET /api/blog/:id      → détail par id (admin)
// GET /api/blog/slug/:slug → détail par slug (public)
// ----------------------------------------------------------------
export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await blogService.getPostById(req.params.id as string);
    return success(res, post);
  } catch (err: any) {
    if (err.name === "NotFoundError") return error(res, err.message, 404);
    return error(res, "Internal server error", 500);
  }
};

export const getPostBySlug = async (req: Request, res: Response) => {
  try {
    // La route publique ne retourne que les articles publiés
    const publicOnly = !("user" in req && (req as AuthRequest).user);
    const post = await blogService.getPostBySlug(
      req.params.slug as string,
      publicOnly,
    );
    return success(res, post);
  } catch (err: any) {
    return error(res, err.message, 404);
  }
};

// ----------------------------------------------------------------
// POST /api/blog  → créer un article
// ----------------------------------------------------------------
export const createPost = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    // Si une illustration a été uploadée, récupérer son chemin
    const illustrationPath = req.file
      ? `/uploads/illustrations/${req.file.filename}`
      : undefined;

    const post = await blogService.createPost(
      req.body,
      req.user!.id,
      illustrationPath,
    );
    return success(res, post, "Article créé", 201);
  } catch (err: any) {
    if (err.statusCode) return error(res, err.message, err.statusCode);
    return error(res, "Internal server error", 500);
  }
};

// ----------------------------------------------------------------
// PATCH /api/blog/:id  → modifier un article
// ----------------------------------------------------------------
export const updatePost = async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return error(res, "Données invalides", 400, errors.array());

  try {
    const newIllustrationPath = req.file
      ? `/uploads/illustrations/${req.file.filename}`
      : undefined;

    const post = await blogService.updatePost(
      req.params.id as string,
      req.body,
      newIllustrationPath,
    );
    return success(res, post, "Article mis à jour");
  } catch (err: any) {
    return error(res, err.message, 400);
  }
};

// ----------------------------------------------------------------
// PATCH /api/blog/:id/toggle  → publier ou dépublier
// ----------------------------------------------------------------
export const toggleStatus = async (req: Request, res: Response) => {
  try {
    const post = await blogService.toggleStatus(req.params.id as string);
    if (!post) return error(res, "Post not found", 404);
    const msg =
      post.status === "PB" ? "Article publié" : "Article dépublié (brouillon)";
    return success(res, post, msg);
  } catch (err: any) {
    if (err.name === "NotFoundError") return error(res, err.message, 404);
    return error(res, err.message, 400);
  }
};

// ----------------------------------------------------------------
// DELETE /api/blog/:id  → supprimer un article
// ----------------------------------------------------------------
export const deletePost = async (req: Request, res: Response) => {
  try {
    await blogService.deletePost(req.params.id as string);
    return success(res, null, "Article supprimé");
  } catch (err: any) {
    return error(res, err.message, 404);
  }
};

// ----------------------------------------------------------------
// GET /api/blog/stats  → statistiques admin
// ----------------------------------------------------------------
export const getStats = async (_req: Request, res: Response) => {
  try {
    const stats = await blogService.getStats();
    return success(res, stats);
  } catch (err: any) {
    return error(res, err.message);
  }
};
