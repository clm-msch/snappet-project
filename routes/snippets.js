import express from "express";
import jwt from "jsonwebtoken";
import createError from "http-errors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import SnippetsValidator from "../validators/SnippetsValidators.js";
import { expressjwt } from "express-jwt";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const router = express.Router();
const auth = expressjwt({
  secret: process.env.JWT_KEY,
  algorithms: ["HS256"],
});

router.post("/snippets", auth, async (req, res, next) => {
  try {
    const snippetsData = SnippetsValidator.parse(req.body);
    const snippets = await prisma.snippets.create({
      data: {
        title: snippetsData.title,
        content: snippetsData.content,
        category: { connect: { id: snippetsData.category_id } },
        tags: {
          connect: snippetsData.tags_id.map((tags_id) => ({ id: tags_id })),
        },
        user: { connect: { id: req.auth.id } },
      },
    });
    res.json({ msg: "Snippets created", snippets });
  } catch (error) {
    res.status(400).json({ errors: error.issues });
  }
});

router.get("/snippets", auth, async (req, res, next) => {
  const snippets = await prisma.snippets.findMany({
    where: { user_id: req.auth.id },
    include: { category: true, tags: true },
  });
  res.json({ msg: "Snippets get", snippets });
});

router.get("/snippets/:id", auth, async (req, res, next) => {
  const snippets = await prisma.snippets.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { category: true, tags: true },
  });
  res.json({ msg: "Snippets get", snippets });
});

router.patch("/snippets/:id", auth, async (req, res, next) => {
  const snippets_id = parseInt(req.params.id);
  try {
    const snippetsData = SnippetsValidator.parse(req.body);
    const snippets = await prisma.snippets.update({
      where: { id: snippets_id },
      data: {
        title: snippetsData.title,
        content: snippetsData.content,
        category: { connect: { id: snippetsData.category_id } },
        user: { connect: { id: req.auth.id } },
      },
    });
    res.json({ msg: "Snippets updated", snippets });
  } catch (error) {
    res.status(400).json({ errors: error.issues });
  }
});

router.delete("/snippets/:id", auth, async (req, res, next) => {
  const snippets_id = parseInt(req.params.id);
  const snippet = await prisma.snippets.findUnique({
    where: { id: snippets_id },
  });
  if (snippet.user_id !== req.auth.id) {
    return res.status(404).json({ msg: "Categories not found" });
  }
  const snippets = await prisma.snippets.delete({
    where: { id: snippets_id },
  });
  res.json({ msg: "Snippets deleted", snippets });
});

export default router;
