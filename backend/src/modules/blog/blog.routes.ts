// src/modules/blog/blog.routes.ts
// Routes du module blog.
//
// Routes PUBLIQUES (sans auth) :
//   GET /api/blog/public          → liste des articles publiés
//   GET /api/blog/slug/:slug      → article par slug
//
// Routes PRIVÉES (auth requise) :
//   GET    /api/blog              → liste complète (admin)
//   GET    /api/blog/stats        → statistiques
//   GET    /api/blog/:id          → détail par id
//   POST   /api/blog              → créer
//   PATCH  /api/blog/:id          → modifier
//   PATCH  /api/blog/:id/toggle   → publier/dépublier
//   DELETE /api/blog/:id          → supprimer

import { Router } from "express";
import { authenticate, isStaff } from "../../middlewares/auth.middleware";
import { uploadIllustration } from "../../middlewares/upload.middleware";
import * as blogController from "./blog.controller";
import {
  createPostValidation,
  updatePostValidation,
  listPostValidation,
  validateIdParam,
  validateSlug,
} from "./blog.validation";

const router = Router();

// ----------------------------------------------------------------
// Routes PUBLIQUES — pas besoin d'être connecté
// ----------------------------------------------------------------
router.get("/public", listPostValidation, blogController.getPublicPosts);
router.get("/slug/:slug", validateSlug, blogController.getPostBySlug);

// ----------------------------------------------------------------
// Routes PRIVÉES — connecté requis à partir d'ici
// ----------------------------------------------------------------
router.use(authenticate);

// Stats (avant /:id pour ne pas confondre "stats" avec un id)
router.get("/stats", blogController.getStats);

// Liste admin + détail
router.get("/", listPostValidation, blogController.getPosts);
router.get("/:id", validateIdParam, blogController.getPostById);

// Création et modification (staff uniquement + upload illustration)
router.post(
  "/",
  isStaff,
  uploadIllustration,
  createPostValidation,
  blogController.createPost,
);
router.patch(
  "/:id",
  validateIdParam,
  isStaff,
  uploadIllustration,
  updatePostValidation,
  blogController.updatePost,
);
router.patch("/:id/toggle", validateIdParam, isStaff, blogController.toggleStatus);
router.delete("/:id", validateIdParam, isStaff, blogController.deletePost);

export default router;
