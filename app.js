import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { expressjwt } from "express-jwt";
import * as dotenv from "dotenv"; // voir https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

// import des routes
import account from "./routes/account.js";
import modify from "./routes/modify.js";
import categories from "./routes/categories.js";
import snippets from "./routes/snippets.js";
import tags from "./routes/tags.js";
// import register from "./routes/register.js";

// initialisation de dotenv
dotenv.config();

// initialisation de Prisma
const prisma = new PrismaClient();

// initialisation de l'application
const app = express();

// autorisation de cross-origin requests
app.use(cors());

// middleware pour parser le JSON
app.use(express.json());

// middleware pour parser les requêtes URL-encoded
app.use(express.urlencoded({ extended: true }));

// middleware pour gérer les erreurs
app.use((err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
        return res.status(401).json({ msg: "Ton JWT est invalide !" });
    }

    // autres erreurs à gérer
    return res.status(err.status).json({ error: err.message });
});

// middleware pour vérifier les JWT
const auth = expressjwt({
    secret: process.env.JWT_KEY,
    algorithms: ["HS256"],
});

// route protégée par JWT
app.get("/secret", auth, (req, res) => {
    res.json({ msg: "tu as accès à cette route" });
});


// routes
app.use("/", account);
app.use("/", modify);
app.use("/", categories);
app.use("/", snippets);
app.use("/", tags);
// app.use("/", register);

// export de l'application
export default app;
