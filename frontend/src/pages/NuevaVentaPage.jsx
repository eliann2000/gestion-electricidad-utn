import { useEffect, useMemo, useState } from "react";
import { clientesApi } from "../services/clientes";
import { productosApi } from "../services/productos";
import { ventasApi } from "../services/ventas";

export default function NuevaVentaPage() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);

  const [clienteId, setClienteId] = useState(""); // opcional
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("1");

  const [items, setItems] = useState([]); // { productoId, nombre, precio, cantidad, subtotal }
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [loading, setLoading] = useState(true);

  async function cargarData() {
    setLoading(true);
    setError("");
    try {
      const [c, p] = await Promise.all([clientesApi.list(), productosApi.list()]);
      setClientes(c.filter((x) => x.activo));
      setProductos(p.filter((x) => x.activo));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarData();
  }, []);

  const total = useMemo(() => items.reduce((acc, it) => acc + it.subtotal, 0), [items]);

  function agregarItem() {
    setError("");
    setOkMsg("");

    const pid = Number(productoId);
    const qty = Number(cantidad);

    if (!pid) return setError("Elegí un producto");
    if (!Number.isFinite(qty) || qty <= 0) return setError("Cantidad inválida");

    const prod = productos.find((p) => p.id === pid);
    if (!prod) return setError("Producto no encontrado");

    // Si ya existe en el carrito, sumamos cantidad
    const existente = items.find((it) => it.productoId === pid);
    const precio = Number(prod.precio);

    const nuevaCantidad = (existente?.cantidad ?? 0) + qty;
    const nuevoSubtotal = precio * nuevaCantidad;

    // Validación simple de stock (front). Igual el backend valida también.
    if (nuevaCantidad > prod.stock) {
      return setError(`Stock insuficiente. Disponible: ${prod.stock}`);
    }

    if (existente) {
      setItems((prev) =>
        prev.map((it) =>
          it.productoId === pid
            ? { ...it, cantidad: nuevaCantidad, subtotal: nuevoSubtotal }
            : it
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        { productoId: pid, nombre: prod.nombre, precio, cantidad: qty, subtotal: precio * qty },
      ]);
    }

    setProductoId("");
    setCantidad("1");
  }

  function quitarItem(pid) {
    setItems((prev) => prev.filter((it) => it.productoId !== pid));
  }

  async function registrarVenta() {
    setError("");
    setOkMsg("");

    if (items.length === 0) return setError("Agregá al menos un producto");

    const body = {
      clienteId: clienteId ? Number(clienteId) : null,
      items: items.map((it) => ({ productoId: it.productoId, cantidad: it.cantidad })),
    };

    try {
      const venta = await ventasApi.create(body);
      setOkMsg(`Venta creada (ID ${venta.id}) - Total: ${venta.total}`);
      setItems([]);
      setClienteId("");
      // recargar productos para ver stock actualizado
      await cargarData();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Nueva Venta</h1>

      {loading && <p>Cargando datos...</p>}

      {error && (
        <div style={{ marginBottom: 12, color: "crimson" }}>
          <b>Error:</b> {error}
        </div>
      )}
      {okMsg && (
        <div style={{ marginBottom: 12, color: "green" }}>
          <b>OK:</b> {okMsg}
        </div>
      )}

      <h2>Cliente (opcional)</h2>
      <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
        <option value="">(Sin cliente)</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.id} - {c.nombre}
          </option>
        ))}
      </select>

      <h2 style={{ marginTop: 20 }}>Agregar productos</h2>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <select value={productoId} onChange={(e) => setProductoId(e.target.value)}>
          <option value="">Elegí producto</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.id} - {p.nombre} (stock {p.stock}) - ${p.precio}
            </option>
          ))}
        </select>

        <input
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          placeholder="Cantidad"
          inputMode="numeric"
          style={{ width: 120 }}
        />

        <button type="button" onClick={agregarItem}>
          Agregar
        </button>
      </div>

      <h2 style={{ marginTop: 20 }}>Carrito</h2>

      {items.length === 0 ? (
        <p>No hay items.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Cantidad</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.productoId}>
                <td>
                  {it.productoId} - {it.nombre}
                </td>
                <td>${it.precio}</td>
                <td>{it.cantidad}</td>
                <td>${it.subtotal}</td>
                <td>
                  <button type="button" onClick={() => quitarItem(it.productoId)}>
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3 style={{ marginTop: 12 }}>Total: ${total}</h3>

      <button type="button" onClick={registrarVenta} disabled={items.length === 0}>
        Registrar venta
      </button>
    </div>
  );
}