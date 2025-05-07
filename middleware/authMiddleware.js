const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const UserModel = require("../models/UserModel");
require("dotenv").config(); // Charger les variables d'environnement

// 🔐 Middleware pour vérifier l'authentification
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Récupérer le token
            token = req.headers.authorization.split(" ")[1];
            console.log(token)

            if (!token) {
                return res.status(401).json({ message: "Accès non autorisé, aucun token fourni" });
            }

            // Vérifier et décoder le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // 🔒 Utilisation d'une variable d'environnement

            // Ajouter l'utilisateur à req.user (sans le mot de passe)
            req.user = await UserModel.findById(decoded.id).select("-password");
            console.log(req.user.role)

            if (!req.user) {
                return res.status(401).json({ message: "Utilisateur introuvable, accès refusé" });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: "Accès non autorisé, token invalide" });
        }
    } else {
        return res.status(401).json({ message: "Accès non autorisé, aucun token" });
    }
});
