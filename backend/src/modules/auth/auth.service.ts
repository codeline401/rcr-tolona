// src/modules/auth/auth.validation.ts
// Toute la logique métier de l'authentification
// Ce fichier interagit avec la base de données via Prisma

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../../config/prisma";
import { isSuperuser } from "../../middlewares/auth.middleware";
import { token } from "morgan";

// Nombre de rounds pour le hashage du mot de passe
const BCRYPT_ROUNDS = 12;
// Durée de validation de token JWT
const JWT_EXPIRES_IN = "1h";
// Durée de validation de token de reset de mot de passe
const RESET_TOKEN_EXPIRES_IN = 3600000; // 1 heure en millisecondes

// ------------------------------------------------------------------------
// Type retourné après un login ou register réussi
// ------------------------------------------------------------------------
interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    isStaff: boolean;
    isSuperuser: boolean;
  };
}

// ------------------------------------------------------------------------
// Générer un token JWT signé
// ------------------------------------------------------------------------
const generateToken = (user: {
  id: string;
  isStaff: boolean;
  isSuperuser: boolean;
}): string => {
  return jwt.sign(
    {
      id: user.id,
      isStaff: user.isStaff,
      isSuperuser: user.isSuperuser,
    },
    process.env.JWT_SECRET!, // Assurez-vous que JWT_SECRET est défini dans votre .env
    { expiresIn: JWT_EXPIRES_IN },
  );
};

// ------------------------------------------------------------------------
// LOGIN - Vérifier email + mot de passe et retourne un token JWT
// ------------------------------------------------------------------------
export const login = async (
  email: string,
  password: string,
): Promise<AuthResult> => {
  // 1. Chercher l'utilisateur par email
  const user = await prisma.user.findUnique({ where: { email } });

  // 2. Vérifier que l'utilisateur existe et que le mot de passe est correct
  // On vérifie les deux ensemble pour ne pas révéler si l'email est correct ou pas
  const isPasswordValid = user
    ? await bcrypt.compare(password, user.password)
    : false;

  if (!user || !isPasswordValid) {
    throw new Error("Email ou mot de passe incorrect");
  }

  // 3. Vérifier que l'utilisateur est actif
  if (!user.isActive) {
    throw new Error("Ce compte est désactivé. Contactez l'administrateur.");
  }

  // 4. Mettre à jour la date de dernière connexion
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  // 5. Générer et retourner le token JWT
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      isStaff: user.isStaff,
      isSuperuser: user.isSuperuser,
    },
  };
};

// ----------------------------------------------------------------
// REGISTER — Créer un nouveau compte utilisateur
// ----------------------------------------------------------------
export const register = async (
  email: string,
  password: string,
): Promise<AuthResult> => {
  // 1. Vérifier que l'email n'est pas déjà utilisé
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Un compte existe déjà avec cet email");
  }

  // 2. Hasher le mot de passe (JAMAIS stocker en clair)
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // 3. Créer l'utilisateur en base
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      isActive: true,
      isStaff: false,
      isSuperuser: false,
    },
  });

  // 4. Générer et retourner le token
  const token = generateToken(user);

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      isStaff: user.isStaff,
      isSuperuser: user.isSuperuser,
    },
  };
};

// ----------------------------------------------------------
// ME - Récupéré le profil de l'utilisateur connecté
// ----------------------------------------------------------
export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      isStaff: true,
      isSuperuser: true,
      isActive: true,
      lastLogin: true,
      createdAt: true,
      // Inclure le membre lié s'il existe
      membre: {
        select: {
          id: true,
          nom: true,
          prenom: true,
          registerNumber: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }
  return user;
};

// ------------------------------------------------------------
// FORGOT PASSWORD - Générer un token de reset et le stocker
//
// Note : A envoyer par email lorsque le service mail sera opétionnel
// ------------------------------------------------------------
export const forgotPassword = async (email: string): Promise<string> => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Sécurité : on ne révèle pas si l'email existe ou non
  if (!user) return "ok";

  // Générer un token aléatoire sécurisé
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_EXPIRES_IN);

  // Stokcer le token hashé en bdd (pas de toekn)
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: resetTokenExpiry,
    },
  });

  // TODO : Envoyer le token par email à l'utilisateur
  // L'email contiendra un lien vers une page frontend pour réinitialiser le mot de passe
  // Le lien aura la forme : https://rcr-frontend/reset-password?token=RESET_TOKEN
  return resetToken; // A supprimer une fois que l'envoi par email est opérationnel
};

// ------------------------------------------------------------
// RESET PASSWORD - Vérifier le token de reset et mettre à jour le mot de passe
// ------------------------------------------------------------
export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<void> => {
  // Hasher le token reçu pour le comparer avec celui stocké en bdd
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Chercher l'utilisateur avec le token hashé et vérifier que le token n'est pas expiré
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { gt: new Date() }, // Vérifie que le token n'est pas expiré
    },
  });

  if (!user) {
    throw new Error("Token de réinitialisation invalide ou expiré");
  }

  // Hasher le nouveau mot de passe
  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  // Mettre à jour le mot de passe de l'utilisateur et supprimer les champs de reset
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null, // Invalider le token de reset après utilisation
      resetPasswordExpiry: null,
    },
  });
};
