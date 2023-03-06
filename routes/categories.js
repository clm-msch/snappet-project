import express from "express";
import { PrismaClient } from "@prisma/client";
import CategoriesValidator from "../validators/CategoriesValidators.js";
import { expressjwt } from "express-jwt";
import dotenv from "dotenv";

// Chargement des variables d'environnement
dotenv.config();

const prisma = new PrismaClient();

// Initialisation du routeur
const router = express.Router();

// Authentification JWT
const auth = expressjwt({
  secret: process.env.JWT_KEY,
  algorithms: ["HS256"],
});

// Création de catégories avec Prisma
router.post("/categories", auth, async (req, res, next) => {
  try {
    const categoriesData = CategoriesValidator.parse(req.body);
    const categories = await prisma.categories.create({
      data: {
        ...categoriesData,
        user: {
          connect: {
            id: req.auth.id,
          },
        },
      },
    });
    res.json({ msg: "Categories created", categories });
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }
});

// Récupération de toutes les catégories avec Prisma
router.get("/categories", auth, async (req, res, next) => {
  const categories = await prisma.categories.findMany({
    where: {
      user_id: req.auth.id,
    },
  });
  res.json({ msg: "Categories get", categories });
});

// Récupération d'une catégorie avec Prisma
router.get("/categories/:id", auth, async (req, res, next) => {
  const categories = await prisma.categories.findUnique({
    where: {
      id: parseInt(req.params.id),
    },
  });
  res.json({ msg: "Categories get", categories });
});

// Mise à jour d'une catégorie avec Prisma
router.patch("/categories/:id", auth, async (req, res, next) => {
  const category_id = parseInt(req.params.id);
  const category = await prisma.categories.findUnique({
    where: {
      id: category_id,
    },
  });

  if (category.user_id !== req.auth.id) {
    return res.status(404).json({ msg: "Categories not found" });
  }

  const categories = await prisma.categories.update({
    where: {
      id: category_id,
    },
    data: {
      ...req.body,
    },
  });

  res.json({ msg: "Categories updated", categories });
});

// Suppression d'une catégorie avec Prisma
router.delete("/categories/:id", auth, async (req, res, next) => {
  const category_id = parseInt(req.params.id);
  const category = await prisma.categories.findUnique({
    where: {
      id: category_id,
    },
  });

  if (category.user_id !== req.auth.id) {
    return res.status(404).json({ msg: "Categories not found" });
  }

  const categories = await prisma.categories.delete({
    where: {
      id: category_id,
    },
  });

  res.json({ msg: "Categories deleted", categories });
});

export default router;
