const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

// GET /api/reportes/stock-bajo
router.get("/stock-bajo", async (req, res) => {
  const productos = await prisma.producto.findMany({
    where: {
      activo: true,
      stock: { lte: prisma.producto.fields.stockMinimo }, // si esto te falla, te doy alternativa simple abajo
    },
    orderBy: { stock: "asc" },
  });

  res.json(productos);
});

module.exports = router;