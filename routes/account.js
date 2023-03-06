// Importation des modules
import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import LoginValidator from "../validators/LoginValidators.js";
import RegisterValidator from "../validators/RegisterValidators.js";

// Initialisation de Prisma
const prisma = new PrismaClient();

// Initialisation du routeur
const router = express.Router();

// Route de connexion
router.post("/login", async (req, res, next) => {
  try {
    const loginData = LoginValidator.parse(req.body);

    // Recherche de l'utilisateur par email
    const user = await prisma.users.findUnique({
      where: {
        email: loginData.email,
      },
    });

    // Vérification de l'existence de l'utilisateur et du mot de passe
    if (!user || !await bcrypt.compare(loginData.password, user.password)) {
      throw createError(403, "Mauvais email / mot de passe");
    }

    // Création du token JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_KEY,
      { expiresIn: "300m" }
    );

    // Envoi de la réponse
    res.json({ token });
  } catch (error) {
    next(error);
  }
});

// Route d'inscription
router.post("/register", async (req, res, next) => {
  try {
    const registerData = RegisterValidator.parse(req.body);

    // Vérification si un utilisateur avec cet e-mail existe déjà
    const user = await prisma.users.findUnique({
      where: {
        email: registerData.email,
      },
    });
    if (user) {
      throw createError(400, "Un compte existe déjà avec cet email.");
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(registerData.password, 10);

    // Création de l'utilisateur
    await prisma.users.create({
      data: {
        email: registerData.email,
        password: hashedPassword,
        image: registerData.image,
      },
    });

    // Envoi de la réponse
    res.json({ msg: "User created" });
  } catch (error) {
    next(error);
  }
});

// Exportation du routeur
export default router;
