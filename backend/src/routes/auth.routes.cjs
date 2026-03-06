const router = require("express").Router();
const jwt = require("jsonwebtoken");

const ADMIN_USER = "admin";
const ADMIN_PASS = "admin";

router.post("/login", async (req, res) => {
    const username = String(req.body?.username ?? "").trim();
    const password = String(req.body?.password ?? "");

    if (!username || !password) {
        return res.status(400).json({ message: "Faltan datos" });
    }

    if (username !== ADMIN_USER || password !== ADMIN_PASS) {
        return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    const token = jwt.sign(
        { username: ADMIN_USER, nombre: "Administrador" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.json({
        token,
        user: {
            username: ADMIN_USER,
            nombre: "Administrador",
        },
    });
});

module.exports = router;