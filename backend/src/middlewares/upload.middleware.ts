// src/middlewares/upload.middleware.ts
// Middleware pour gérer les uploads de fichiers avec Multer. (photo membre, etc.)
// Les fichiers sont stockés dans le dossier "uploads/" à la racine du backend

import multer from "multer";
import path from "path";
import fs from "fs";
import { Request } from "express";

// Taille maximale autorisée pour les fichiers uploadés (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Extension d'image autorisées
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

// ---------------------------------------------------------------------------
// Créer le dossier "uploads/" s'il n'existe pas déjà
// ---------------------------------------------------------------------------
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true }); // recursive: true permet de créer les dossiers parents si besoin
  }
};

// ---------------------------------------------------------------------------
// Moteur de stockage : définit où et sous quel nom sauvegarder les fichiers uploadés
// ---------------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (_req: Request, _file, cb) => {
    const uploadDir = path.join(__dirname, "..", "..", "uploads", "membres");
    ensureDir(uploadDir); // on s'assure que le dossier existe avant de sauvegarder les fichiers
    cb(null, uploadDir); // on indique à Multer de sauvegarder les fichiers dans "uploads/membres/"
  },

  filename: (_req: Request, file, cb) => {
    // Nom unique : timestamp + nombre aléatoire + extension originale
    // Evite les collisions et les caractères spéciaux dans le nom
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName); // on indique à Multer de sauvegarder le fichier sous ce nom unique
  },
});

// ---------------------------------------------------------------------------
// Filtre de fichiers : vérifie que le fichier uploadé est une image et respecte la taille max
// ---------------------------------------------------------------------------
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true); // le fichier est accepté
  } else {
    cb(new Error("Fichier non autorisé. Seules les images sont acceptées.")); // le fichier est rejeté
  }
};

// ---------------------------------------------------------------------------
// Instance Multer pour les photos membres
// ---------------------------------------------------------------------------
export const uploadMember = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single("photo"); // on attend un champ "photo" contenant le fichier à uploader

// ---------------------------------------------------------------------------
// Instance Multer pour les illustrations de blog/activités
// ---------------------------------------------------------------------------
export const uploadIllustration = multer({
  storage: multer.diskStorage({
    destination: (_req: Request, _file, cb) => {
      const uploadDir = path.join(
        __dirname,
        "..",
        "..",
        "uploads",
        "illustrations",
      );
      ensureDir(uploadDir);
      cb(null, uploadDir);
    },

    filename: (_req: Request, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`); // même logique de nom unique que pour les photos membres
    },
  }),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single("illustration"); // on attend un champ "illustration" contenant le fichier à uploader
