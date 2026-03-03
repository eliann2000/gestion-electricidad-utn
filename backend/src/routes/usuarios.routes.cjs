const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const { requireAdmin } = require("../middlewares/auth.cjs");

const prisma = new PrismaClient();

// ✅ todo el ABM de usuarios solo admin
router.use(requireAdmin);

// GET /api/usuarios
router.get("/", async (_req, res) => {
    const users = await prisma.usuario.findMany({
        select: { id: true, username: true, rol: true, createdAt: true },
        orderBy: { id: "asc" },
    });
    res.json(users);
});

// POST /api/usuarios
router.post("/", async (req, res) => {
    const username = String(req.body?.username ?? "").trim();
    const password = String(req.body?.password ?? "");
    const rol = req.body?.rol === "ADMIN" ? "ADMIN" : "VENDEDOR";

    if (!username || !password) return res.status(400).json({ message: "Faltan datos" });

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const u = await prisma.usuario.create({ data: { username, passwordHash, rol } });
        res.status(201).json({ id: u.id, username: u.username, rol: u.rol });
    } catch {
        res.status(409).json({ message: "Username ya existe" });
    }
});

// PUT /api/usuarios/:id
router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const username = String(req.body?.username ?? "").trim();
    const rol = req.body?.rol === "ADMIN" ? "ADMIN" : "VENDEDOR";
    const password = String(req.body?.password ?? "");

    if (!Number.isFinite(id)) return res.status(400).json({ message: "ID inválido" });
    if (!username) return res.status(400).json({ message: "Username obligatorio" });

    // ✅ No permitir que el último ADMIN pase a VENDEDOR
    const actual = await prisma.usuario.findUnique({ where: { id } });
    if (!actual) return res.status(404).json({ message: "Usuario no encontrado" });

    if (actual.rol === "ADMIN" && rol !== "ADMIN") {
        const admins = await prisma.usuario.count({ where: { rol: "ADMIN" } });
        if (admins <= 1) {
            return res.status(400).json({
                message: "No se puede cambiar el rol del último ADMIN a VENDEDOR. Debe existir al menos un ADMIN en el sistema.",
            });
        }
    }

    const data = { username, rol };
    if (password) data.passwordHash = await bcrypt.hash(password, 10);

    try {
        const u = await prisma.usuario.update({ where: { id }, data });
        res.json({ id: u.id, username: u.username, rol: u.rol });
    } catch {
        res.status(404).json({ message: "Usuario no encontrado" });
    }
});

// DELETE /api/usuarios/:id (con reglas)
router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ message: "ID inválido" });

    // 1) no podés borrarte
    if (req.user?.uid === id) {
        return res.status(400).json({ message: "No podés borrarte a vos mismo" });
    }

    // 2) usuario existe?
    const u = await prisma.usuario.findUnique({ where: { id } });
    if (!u) return res.status(404).json({ message: "Usuario no encontrado" });

    // 3) no borrar último admin
    if (u.rol === "ADMIN") {
        const admins = await prisma.usuario.count({ where: { rol: "ADMIN" } });
        if (admins <= 1) {
            return res.status(400).json({ message: "No podés borrar el último admin" });
        }
    }

    await prisma.usuario.delete({ where: { id } });
    res.status(204).send();
});

module.exports = router;