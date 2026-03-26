const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// GET /api/productos
router.get("/", async (req, res) => {
  const productos = await prisma.producto.findMany({
    include: { marca: true },
    orderBy: { id: "desc" },
  });
  res.json(productos);
});

// GET /api/productos/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const producto = await prisma.producto.findUnique({
    where: { id },
    include: { marca: true },
  });

  if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(producto);
});

// POST /api/productos
router.post("/", async (req, res) => {
  const { codigo, nombre, marcaId, precio, stock, stockMinimo, activo } = req.body;

  if (!codigo || !codigo.trim()) {
    return res.status(400).json({ error: "El código es obligatorio" });
  }

  const nuevo = await prisma.producto.create({
    data: {
      codigo,
      nombre,
      marcaId: marcaId ?? null,
      precio,
      stock: stock ?? 0,
      stockMinimo: stockMinimo ?? 0,
      activo: activo ?? true,
    },
    include: { marca: true },
  });

  res.status(201).json(nuevo);
});

// PUT /api/productos/:id
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { codigo, nombre, marcaId, precio, stock, stockMinimo, activo } = req.body;

  if (!codigo || !codigo.trim()) {
    return res.status(400).json({ error: "El código es obligatorio" });
  }

  try {
    const actualizado = await prisma.producto.update({
      where: { id },
      data: { codigo, nombre, marcaId: marcaId ?? null, precio, stock, stockMinimo, activo },
      include: { marca: true },
    });

    res.json(actualizado);
  } catch (e) {
    if (e?.code === "P2025") {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    console.error(e);
    return res.status(500).json({ error: "Error interno al actualizar producto" });
  }
});

// DELETE /api/productos/:id
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    await prisma.producto.delete({ where: { id } });
    return res.status(204).send();
  } catch (e) {

    if (e?.code === "P2025") {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    console.error(e);
    return res.status(500).json({ error: "Error interno al eliminar producto" });
  }
});

module.exports = router;