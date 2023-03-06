import * as dotenv from "dotenv";
dotenv.config();

import express from "express";

import createError from "http-errors";

import { PrismaClient } from "@prisma/client";

import bcrypt from "bcrypt";

import ModifyValidator from "../validators/modifyValidators.js";

import { expressjwt } from "express-jwt";

const prisma = new PrismaClient();

// j'initialise un routeur

const router = express.Router();

const auth = expressjwt({
  secret: process.env["JWT_KEY"],
  algorithms: ["HS256"],
});

router.patch("/user", auth, async (req, res, next) => {
  let modifyData;
  try {
    modifyData = ModifyValidator.parse(req.body);
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }

  const user = await prisma.users.findFirst({
    where: {
      id: req.auth.id,
    },
  });

  if (!user) return next(createError(403, "Mauvais email / mot de passe"));

  const userUpdated = await prisma.users.update({
    where: {
      id: req.auth.id,
    },
    data: {
      ...modifyData,
      updatedAt: new Date(),
    },
  });

  res.json({ msg: "User Modified", userUpdated });
});

export default router;
