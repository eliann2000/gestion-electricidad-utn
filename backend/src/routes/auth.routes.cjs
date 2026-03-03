const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

router.post("/dev-set-password", async (req, res) => {
    const username = String(req.body?.username ?? "").trim();
    const password = String(req.body?.password ?? "");

    if (!username || !password) return res.status(400).json({ message: "Faltan datos" });

    try {
        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.usuario.update({
            where: { username },
            data: { passwordHash },
            select: { id: true, username: true, rol: true },
        });

        res.json({ ok: true, user });
    } catch {
        res.status(404).json({ message: "Usuario no encontrado" });
    }
});

router.post("/login", async (req, res) => {
    const username = String(req.body?.username ?? "").trim();
    const password = String(req.body?.password ?? "");

    if (!username || !password) return res.status(400).json({ message: "Faltan datos" });

    const user = await prisma.usuario.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ message: "Usuario o contraseña incorrectos" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Usuario o contraseña incorrectos" });

    const token = jwt.sign(
        { uid: user.id, rol: user.rol, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.json({ token, user: { id: user.id, username: user.username, rol: user.rol } });
});

module.exports = router;