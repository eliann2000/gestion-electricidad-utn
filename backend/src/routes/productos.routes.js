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
  const { nombre, marcaId, categoria, precio, stock, stockMinimo, activo } = req.body;

  const nuevo = await prisma.producto.create({
    data: {
      nombre,
      marcaId: marcaId ?? null,
      categoria: categoria ?? null,
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
  const { nombre, marcaId, categoria, precio, stock, stockMinimo, activo } = req.body;

  try {
    const actualizado = await prisma.producto.update({
      where: { id },
      data: { nombre, marcaId: marcaId ?? null, categoria, precio, stock, stockMinimo, activo },
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
    if (e?.code === "P2003") {
      return res.status(409).json({
        error:
          "No se puede eliminar este producto porque ya fue utilizado en una venta. Marcá el producto como Inactivo.",
      });
    }

    if (e?.code === "P2025") {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    console.error(e);
    return res.status(500).json({ error: "Error interno al eliminar producto" });
  }
});

module.exports = router;