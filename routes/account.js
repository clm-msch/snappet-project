import * as dotenv from "dotenv";
dotenv.config();

import express from "express";

import jwt from "jsonwebtoken";

import createError from "http-errors";

import { PrismaClient } from "@prisma/client";

import bcrypt from "bcrypt";

import LoginValidator from "../validators/LoginValidators.js";

import RegisterValidator from "../validators/RegisterValidators.js";

const prisma = new PrismaClient();

// j'initialise un routeur
const router = express.Router();

router.post("/login", async (req, res, next) => {
  let loginData;
  try {
    loginData = LoginValidator.parse(req.body);
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }

  const user = await prisma.users.findFirst({
    where: {
      email: loginData.email,
    },
  });

  if (!user) return next(createError(403, "Mauvais email / mot de passe"));

  const passwordIsGood = await bcrypt.compare(
    loginData.password,
    user.password
  );

  if (!passwordIsGood)
    return next(createError(403, "Mauvais email / mot de passe"));

  // puis on renvoie le token
  res.json({
    token: jwt.sign(
      // payload
      {
        id: user.id,
      },
      // clef pour signer le token
      process.env["JWT_KEY"],
      // durée du token
      {
        expiresIn: "300m",
      }
    ),
  });
});

router.post("/register", async (req, res, next) => {
  let RegisterData;
  try {
    RegisterData = RegisterValidator.parse(req.body);
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }

  // Verif si ya deja un mail
  const user = await prisma.users.findFirst({
    where: {
      email: RegisterData.email,
    },
  });
  if (user)
    return next(createError(400, "Un compte existe déjà avec cet email."));

  //cryptage password
  const hashedPassword = await bcrypt.hash(RegisterData.password, 10);

  //creation profile
  await prisma.users.create({
    data: {
      email: RegisterData.email,
      password: hashedPassword,
      image: RegisterData.image,
    },
  });

  // puis on renvoie le token
  res.json({ msg: "User created" });
});

export default router;
