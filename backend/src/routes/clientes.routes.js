const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// GET /api/clientes  -> lista todos
router.get("/", async (req, res) => {
  const clientes = await prisma.cliente.findMany({ orderBy: { id: "desc" } });
  res.json(clientes);
});

// GET /api/clientes/:id -> trae uno por id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const cliente = await prisma.cliente.findUnique({ where: { id } });

  if (!cliente) return res.status(404).json({ error: "Cliente no encontrado" });
  res.json(cliente);
});

// POST /api/clientes -> crea uno
router.post("/", async (req, res) => {
  try {
    const { nombre, apellido, telefono, email, direccion } = req.body;

    if (!nombre?.trim()) return res.status(400).json({ error: "El nombre es obligatorio" });
    if (!apellido?.trim()) return res.status(400).json({ error: "El apellido es obligatorio" });
    if (!telefono?.trim()) return res.status(400).json({ error: "El teléfono es obligatorio" });
    if (!email?.trim()) return res.status(400).json({ error: "El email es obligatorio" });

    const nuevo = await prisma.cliente.create({
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        direccion: direccion?.trim() ? direccion.trim() : null,
      },
    });

    res.status(201).json(nuevo);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error interno al crear cliente" });
  }
});

// PUT /api/clientes/:id -> actualiza
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const { nombre, apellido, telefono, email, direccion } = req.body;

    if (!nombre?.trim()) return res.status(400).json({ error: "El nombre es obligatorio" });
    if (!apellido?.trim()) return res.status(400).json({ error: "El apellido es obligatorio" });
    if (!telefono?.trim()) return res.status(400).json({ error: "El teléfono es obligatorio" });
    if (!email?.trim()) return res.status(400).json({ error: "El email es obligatorio" });

    const actualizado = await prisma.cliente.update({
      where: { id },
      data: {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        direccion: direccion?.trim() ? direccion.trim() : null,
      },
    });

    res.json(actualizado);
  } catch (e) {
    // P2025: registro no encontrado
    if (e?.code === "P2025") {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    console.error(e);
    res.status(500).json({ error: "Error interno al actualizar cliente" });
  }
});

// DELETE /api/clientes/:id -> borra
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.cliente.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    // P2003: FK constraint (cliente con ventas)
    if (e?.code === "P2003") {
      return res.status(409).json({
        error: "No se puede eliminar este cliente porque tiene ventas asociadas.",
      });
    }

    // P2025: no encontrado
    if (e?.code === "P2025") {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    console.error(e);
    res.status(500).json({ error: "Error interno al eliminar cliente" });
  }
});

module.exports = router;