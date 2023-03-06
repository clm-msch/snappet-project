import * as dotenv from "dotenv";
dotenv.config();

import express from "express";

import jwt from "jsonwebtoken";

import createError from "http-errors";

import { PrismaClient } from "@prisma/client";

import bcrypt from "bcrypt";

import TagsValidator from "../validators/TagsValidators.js";

import { expressjwt } from "express-jwt";

const prisma = new PrismaClient();

// j'initialise un routeur
const router = express.Router();

const auth = expressjwt({
  secret: process.env["JWT_KEY"],
  algorithms: ["HS256"],
});

//create tags with prisma

router.post("/tags", auth, async (req, res, next) => {
  let tagsData;
  try {
    tagsData = TagsValidator.parse(req.body);
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }

  const tags = await prisma.tags.create({
    data: {
      ...tagsData,
      user: {
        connect: {
          id: req.auth.id,
        },
      },
    },
  });

  res.json({ msg: "Tags created", tags });
});

//get all tags with prisma

router.get("/tags", auth, async (req, res, next) => {
  const tags = await prisma.tags.findMany({
    where: {
      user_id: req.auth.id,
    },
  });

  res.json({ msg: "Tags get", tags });
});

//update one tags with prisma

router.patch("/tags/:id", auth, async (req, res, next) => {
  const tags_id = parseInt(req.params.id);

  let tagsData;
  try {
    tagsData = TagsValidator.parse(req.body);
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }

  let tag = await prisma.tags.findFirst({
    where: {
      id: tags_id,
    },
  });

  if (tag.user_id !== req.auth.id) {
    return res.status(404).json({ msg: "Tags Not Found" });
  }

  const tags = await prisma.tags.update({
    where: {
      id: tags_id,
    },
    data: {
      ...tagsData,
    },
  });

  res.json({ msg: "Tags updated", tags });
});

//delete one tags with prisma

router.delete("/tags/:id", auth, async (req, res, next) => {
  const tags_id = parseInt(req.params.id);

  let tag = await prisma.tags.findUnique({
    where: {
      id: tags_id,
    },
  });

  if (tag.user_id !== req.auth.id) {
    return res.status(404).json({ msg: "Tags Not Found" });
  }

  const tags = await prisma.tags.delete({
    where: {
      id: tags_id,
    },
  });

  res.json({ msg: "Tags deleted", tags });
});

export default router;
