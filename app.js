// Importation des modules
import express from "express";
import { PrismaClient } from "@prisma/client";
//--------------------------------------------

// Importation des routes
import userRoutes from "./routers/user.js";
import postRoutes from "./routers/post.js";
import createSnippetRoutes from "./routers/createSnippet.js";

// -------------------------------------------
const prisma = new PrismaClient();
const app = express();

