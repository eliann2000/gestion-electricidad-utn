const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// GET /api/productos
router.get("/", async (req, res) => {
  const productos = await prisma.producto.findMany({ orderBy: { id: "desc" } });
  res.json(productos);
});

// GET /api/productos/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const producto = await prisma.producto.findUnique({ where: { id } });

  if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(producto);
});

// POST /api/productos
router.post("/", async (req, res) => {
  const { nombre, marca, categoria, precio, stock, stockMinimo, activo } = req.body;

  const nuevo = await prisma.producto.create({
    data: {
      nombre,
      marca: marca ?? null,
      categoria: categoria ?? null,
      precio,
      stock: stock ?? 0,
      stockMinimo: stockMinimo ?? 0,
      activo: activo ?? true,
    },
  });

  res.status(201).json(nuevo);
});

// PUT /api/productos/:id
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, marca, categoria, precio, stock, stockMinimo, activo } = req.body;

  try {
    const actualizado = await prisma.producto.update({
      where: { id },
      data: { nombre, marca, categoria, precio, stock, stockMinimo, activo },
    });

    res.json(actualizado);
  } catch (e) {
    // P2025: registro no encontrado
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
    // P2003: foreign key constraint (producto usado en DetalleVenta)
    if (e?.code === "P2003") {
      return res.status(409).json({
        error:
          "No se puede eliminar este producto porque ya fue utilizado en una venta. Marcá el producto como Inactivo.",
      });
    }

    // P2025: no existe
    if (e?.code === "P2025") {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    console.error(e);
    return res.status(500).json({ error: "Error interno al eliminar producto" });
  }
});

module.exports = router;