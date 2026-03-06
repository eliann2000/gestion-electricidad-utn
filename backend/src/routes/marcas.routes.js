const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// GET /api/marcas
router.get("/", async (req, res) => {
    try {
        const marcas = await prisma.marca.findMany({
            orderBy: { id: "desc" },
        });

        res.json(marcas);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error interno al obtener marcas" });
    }
});

// GET /api/marcas/:id
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const marca = await prisma.marca.findUnique({
            where: { id },
        });

        if (!marca) {
            return res.status(404).json({ error: "Marca no encontrada" });
        }

        res.json(marca);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error interno al obtener marca" });
    }
});

// POST /api/marcas
router.post("/", async (req, res) => {
    try {
        const { nombre, descripcion, paginaWeb, activo } = req.body;

        if (!nombre?.trim()) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        const nueva = await prisma.marca.create({
            data: {
                nombre: nombre.trim(),
                descripcion: descripcion?.trim() ? descripcion.trim() : null,
                paginaWeb: paginaWeb?.trim() ? paginaWeb.trim() : null,
                activo: activo ?? true,
            },
        });

        res.status(201).json(nueva);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Error interno al crear marca" });
    }
});

// PUT /api/marcas/:id
router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const { nombre, descripcion, paginaWeb, activo } = req.body;

        if (!nombre?.trim()) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        const actualizada = await prisma.marca.update({
            where: { id },
            data: {
                nombre: nombre.trim(),
                descripcion: descripcion?.trim() ? descripcion.trim() : null,
                paginaWeb: paginaWeb?.trim() ? paginaWeb.trim() : null,
                activo: activo ?? true,
            },
        });

        res.json(actualizada);
    } catch (e) {
        if (e?.code === "P2025") {
            return res.status(404).json({ error: "Marca no encontrada" });
        }

        console.error(e);
        res.status(500).json({ error: "Error interno al actualizar marca" });
    }
});

// DELETE /api/marcas/:id
router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        await prisma.marca.delete({
            where: { id },
        });

        res.status(204).send();
    } catch (e) {
        if (e?.code === "P2025") {
            return res.status(404).json({ error: "Marca no encontrada" });
        }

        console.error(e);
        res.status(500).json({ error: "Error interno al eliminar marca" });
    }
});

module.exports = router;