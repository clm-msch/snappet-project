import * as dotenv from "dotenv";
dotenv.config();

import express from "express";

import jwt from "jsonwebtoken";

import createError from "http-errors";

import { PrismaClient } from "@prisma/client";

import bcrypt from "bcrypt";

import CategoriesValidator from "../validators/CategoriesValidators.js";

import { expressjwt } from "express-jwt";

const prisma = new PrismaClient();

// j'initialise un routeur
const router = express.Router();

const auth = expressjwt({
  secret: process.env["JWT_KEY"],
  algorithms: ["HS256"],
});

//create categories with prisma

router.post("/categories", auth, async (req, res, next) => {
  let categoriesData;
  try {
    categoriesData = CategoriesValidator.parse(req.body);
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }

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
});

//get all categories with prisma

router.get("/categories", auth, async (req, res, next) => {
  const categories = await prisma.categories.findMany(
    {
      where: {
        user_id: req.auth.id,
      },
    }
  );

  res.json({ msg: "Categories get", categories });
});

//get one categories with prisma

router.get("/categories/:id", auth, async (req, res, next) => {
  const categories = await prisma.categories.findUnique({
    where: {
      id: req.params.id,
    },
  });

  res.json({ msg: "Categories get", categories });
});

//update categories with prisma

router.patch("/categories/:id", auth, async (req, res, next) => {
  const category_id = parseInt(req.params.id);

  let category = await prisma.categories.findUnique({
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

//delete categories with prisma

router.delete("/categories/:id", auth, async (req, res, next) => {
  const category_id = parseInt(req.params.id);
  let category = await prisma.categories.findUnique({
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
