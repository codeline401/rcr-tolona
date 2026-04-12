import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body; // Récupération de l'email et du mot de passe depuis le corps de la requête
  const user = await prisma.user.findUnique({ where: { email } }); // Recherche de l'utilisateur dans la base de données par email
  const isPasswordValid = user
    ? await bcrypt.compare(password, user.password)
    : false; // Vérification du mot de passe en le comparant avec le hash stocké dans la base de données

  if (!user || !isPasswordValid) {
    return res.status(401).json({ message: "Email ou mot de passe incorrect" }); // Si l'utilisateur n'existe pas ou si le mot de passe est invalide, renvoyer une réponse 401 Unauthorized
  }

  const token = jwt.sign(
    { id: user.id, isStaff: user.isStaff }, // Payload du token JWT contenant l'ID de l'utilisateur et son statut de membre du personnel
    process.env.JWT_SECRET! as string, // Clé secrète pour signer le token JWT, stockée dans les variables d'environnement
    { expiresIn: "1h" }, // Durée de validité du token JWT (1 heure)
  );
  return res.json({
    token,
    user: { id: user.id, email: user.email, isStaff: user.isStaff },
  }); // Renvoie le token JWT au client
};
