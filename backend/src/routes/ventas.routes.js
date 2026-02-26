const express = require("express");
const prisma = require("../prisma");

const router = express.Router();

/**
 * GET /api/ventas
 * Lista ventas (sin detalles, solo resumen)
 */
router.get("/", async (req, res) => {
  const ventas = await prisma.venta.findMany({
    orderBy: { id: "desc" },
    include: { cliente: true }, // para ver el cliente si existe
  });

  res.json(ventas);
});

/**
 * GET /api/ventas/:id
 * Trae una venta con sus detalles y productos
 */
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);

  const venta = await prisma.venta.findUnique({
    where: { id },
    include: {
      cliente: true,
      detalles: {
        include: { producto: true },
      },
    },
  });

  if (!venta) return res.status(404).json({ message: "Venta no encontrada" });
  res.json(venta);
});

/**
 * POST /api/ventas
 * Crea una venta completa:
 * - valida stock
 * - calcula total
 * - crea venta + detalles
 * - descuenta stock
 * TODO en una transacción
 */
router.post("/", async (req, res) => {
  const { clienteId, items } = req.body;

  // Validaciones simples (MVP)
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items debe ser un array con al menos un item" });
  }

  // Normalizamos clienteId (puede ser null)
  const clienteIdNumber = clienteId ? Number(clienteId) : null;

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      // 1) Traer productos involucrados
      const productoIds = items.map((i) => Number(i.productoId));
      const productos = await tx.producto.findMany({
        where: { id: { in: productoIds } },
      });

      // 2) Validar que existan
      if (productos.length !== productoIds.length) {
        return { error: "Uno o más productos no existen" };
      }

      // 3) Armar detalles calculando precio/subtotal + validar stock
      let total = 0;

      const detallesData = items.map((item) => {
        const productoId = Number(item.productoId);
        const cantidad = Number(item.cantidad);

        if (!Number.isFinite(cantidad) || cantidad <= 0) {
          throw new Error("Cantidad inválida");
        }

        const producto = productos.find((p) => p.id === productoId);

        // Validar stock suficiente
        if (producto.stock < cantidad) {
          throw new Error(`Stock insuficiente para producto ID ${productoId}`);
        }

        // Prisma devuelve Decimal; lo convertimos a número para calcular en JS
        const precioUnitario = Number(producto.precio);
        const subtotal = precioUnitario * cantidad;

        total += subtotal;

        return {
          productoId,
          cantidad,
          precioUnitario, // Prisma Decimal lo acepta como number
          subtotal,
        };
      });

      // 4) Crear Venta (total provisional 0, luego update)
      const venta = await tx.venta.create({
        data: {
          clienteId: clienteIdNumber,
          total: 0,
        },
      });

      // 5) Crear DetalleVenta (asociados a la venta)
      await tx.detalleVenta.createMany({
        data: detallesData.map((d) => ({
          ventaId: venta.id,
          productoId: d.productoId,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          subtotal: d.subtotal,
        })),
      });

      // 6) Descontar stock de productos
      for (const d of detallesData) {
        await tx.producto.update({
          where: { id: d.productoId },
          data: {
            stock: { decrement: d.cantidad },
          },
        });
      }

      // 7) Actualizar total real
      const ventaFinal = await tx.venta.update({
        where: { id: venta.id },
        data: { total },
      });

      // 8) Devolver venta completa (opcional: con detalles)
      const ventaCompleta = await tx.venta.findUnique({
        where: { id: ventaFinal.id },
        include: {
          cliente: true,
          detalles: { include: { producto: true } },
        },
      });

      return ventaCompleta;
    });

    // Si en transaction devolvimos un objeto con error
    if (resultado && resultado.error) {
      return res.status(400).json({ message: resultado.error });
    }

    res.status(201).json(resultado);
  } catch (err) {
    // Errores típicos: stock insuficiente, cantidad inválida, etc.
    res.status(400).json({ message: err.message || "Error creando venta" });
  }
});

module.exports = router;