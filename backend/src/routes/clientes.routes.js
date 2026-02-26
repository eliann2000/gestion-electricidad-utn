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

  if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });
  res.json(cliente);
});

// POST /api/clientes -> crea uno
router.post("/", async (req, res) => {
  const { nombre, telefono, email, direccion, activo } = req.body;

  const nuevo = await prisma.cliente.create({
    data: {
      nombre,
      telefono: telefono ?? null,
      email: email ?? null,
      direccion: direccion ?? null,
      activo: activo ?? true,
    },
  });

  res.status(201).json(nuevo);
});

// PUT /api/clientes/:id -> actualiza
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, telefono, email, direccion, activo } = req.body;

  const actualizado = await prisma.cliente.update({
    where: { id },
    data: { nombre, telefono, email, direccion, activo },
  });

  res.json(actualizado);
});

// DELETE /api/clientes/:id -> borra
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.cliente.delete({ where: { id } });
  res.status(204).send();
});

module.exports = router;