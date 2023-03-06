import express from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import createError from "http-errors";
import { expressjwt } from "express-jwt";
import TagsValidator from "../validators/TagsValidators.js";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

const router = express.Router();

const auth = expressjwt({
  secret: process.env.JWT_KEY,
  algorithms: ["HS256"],
});

router.post("/tags", auth, async (req, res, next) => {
  try {
    const tagsData = TagsValidator.parse(req.body);

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
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }
});

router.get("/tags", auth, async (req, res, next) => {
  const tags = await prisma.tags.findMany({
    where: {
      user_id: req.auth.id,
    },
  });

  res.json({ msg: "Tags retrieved", tags });
});

router.patch("/tags/:id", auth, async (req, res, next) => {
  const tags_id = parseInt(req.params.id);

  try {
    const tagsData = TagsValidator.parse(req.body);

    let tag = await prisma.tags.findFirst({
      where: {
        id: tags_id,
      },
    });

    if (tag.user_id !== req.auth.id) {
      return res.status(404).json({ msg: "Tags Not Found" });
    }

    const updatedTag = await prisma.tags.update({
      where: {
        id: tags_id,
      },
      data: {
        ...tagsData,
      },
    });

    res.json({ msg: "Tags updated", tags: updatedTag });
  } catch (error) {
    return res.status(400).json({ errors: error.issues });
  }
});

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

  const deletedTag = await prisma.tags.delete({
    where: {
      id: tags_id,
    },
  });

  res.json({ msg: "Tags deleted", tags: deletedTag });
});

export default router;
