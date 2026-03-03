const jwt = require("jsonwebtoken");

// Verifica token y guarda req.user
function authRequired(req, res, next) {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;

    if (!token) return res.status(401).json({ message: "No autenticado" });

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET); // {uid, rol, username}
        next();
    } catch {
        return res.status(401).json({ message: "Token inválido" });
    }
}

// Solo admin
function requireAdmin(req, res, next) {
    if (req.user?.rol !== "ADMIN") return res.status(403).json({ message: "Solo ADMIN" });
    next();
}

module.exports = { authRequired, requireAdmin };