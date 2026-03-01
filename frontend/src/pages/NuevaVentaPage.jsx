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

  // Edición por fila del carrito
  const [editRowPid, setEditRowPid] = useState(null); // productoId de la fila que edito
  const [editProductoId, setEditProductoId] = useState("");
  const [editCantidad, setEditCantidad] = useState("1");

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

    const existente = items.find((it) => it.productoId === pid);
    const precio = Number(prod.precio);

    const nuevaCantidad = (existente?.cantidad ?? 0) + qty;
    const nuevoSubtotal = precio * nuevaCantidad;

    if (nuevaCantidad > prod.stock) {
      return setError(`Stock insuficiente. Disponible: ${prod.stock}`);
    }

    if (existente) {
      setItems((prev) =>
        prev.map((it) =>
          it.productoId === pid ? { ...it, cantidad: nuevaCantidad, subtotal: nuevoSubtotal } : it
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
    if (editRowPid === pid) cancelarEdicion();
    setItems((prev) => prev.filter((it) => it.productoId !== pid));
  }

  function iniciarEdicion(it) {
    setError("");
    setOkMsg("");
    setEditRowPid(it.productoId);
    setEditProductoId(String(it.productoId));
    setEditCantidad(String(it.cantidad));
  }

  function cancelarEdicion() {
    setEditRowPid(null);
    setEditProductoId("");
    setEditCantidad("1");
  }

  function guardarEdicion() {
    setError("");
    setOkMsg("");

    const oldPid = editRowPid;
    const newPid = Number(editProductoId);
    const newQty = Number(editCantidad);

    if (!oldPid) return;
    if (!newPid) return setError("Elegí un producto");
    if (!Number.isFinite(newQty) || newQty <= 0) return setError("Cantidad inválida");

    const prodNuevo = productos.find((p) => p.id === newPid);
    if (!prodNuevo) return setError("Producto no encontrado");

    if (newQty > prodNuevo.stock) {
      return setError(`Stock insuficiente. Disponible: ${prodNuevo.stock}`);
    }

    // Si cambia a un producto que ya existe en carrito, vamos a fusionar
    const existente = items.find((x) => x.productoId === newPid && x.productoId !== oldPid);
    if (existente) {
      const qtyFusion = existente.cantidad + newQty;
      if (qtyFusion > prodNuevo.stock) {
        return setError(`No se puede fusionar: stock insuficiente. Disponible: ${prodNuevo.stock}`);
      }
    }

    const precioNuevo = Number(prodNuevo.precio);

    setItems((prev) => {
      const sinViejo = prev.filter((x) => x.productoId !== oldPid);

      // Fusionar si ya existe
      const yaEsta = sinViejo.find((x) => x.productoId === newPid);
      if (yaEsta) {
        const qtyFusion = yaEsta.cantidad + newQty;
        return sinViejo.map((x) =>
          x.productoId === newPid
            ? { ...x, cantidad: qtyFusion, subtotal: Number(x.precio) * qtyFusion }
            : x
        );
      }

      // Reemplazar por nuevo item
      return [
        ...sinViejo,
        {
          productoId: newPid,
          nombre: prodNuevo.nombre,
          precio: precioNuevo,
          cantidad: newQty,
          subtotal: precioNuevo * newQty,
        },
      ].sort((a, b) => a.productoId - b.productoId);
    });

    cancelarEdicion();
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
      cancelarEdicion();
      await cargarData();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="m0">Nueva Venta</h1>
          <p className="m0" style={{ color: "var(--muted)", marginTop: 6 }}>
            Cargá items, registrá la venta y el stock se descuenta automáticamente.
          </p>
        </div>
      </div>

      {loading && (
        <p className="mt12" style={{ color: "var(--muted)" }}>
          Cargando datos...
        </p>
      )}

      {error && (
        <div className="alert alertError mt12">
          <b>Error:</b> {error}
        </div>
      )}

      {okMsg && (
        <div className="alert alertOk mt12">
          <b>OK:</b> {okMsg}
        </div>
      )}

      <div className="mt12 card cardFlat">
        <h2 className="cardTitle">Cliente (opcional)</h2>

        <label className="label">Seleccionar cliente</label>
        <select className="select" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          <option value="">(Sin cliente)</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id} - {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="mt12 card cardFlat">
        <h2 className="cardTitle">Agregar productos</h2>

        <div className="grid2">
          <div>
            <label className="label">Producto</label>
            <select className="select" value={productoId} onChange={(e) => setProductoId(e.target.value)}>
              <option value="">Elegí producto</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} - {p.nombre} (stock {p.stock}) - ${p.precio}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Cantidad</label>
            <input
              className="input"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ej: 1"
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="row mt12" style={{ justifyContent: "flex-end" }}>
          <button className="btn btnPrimary" type="button" onClick={agregarItem}>
            Agregar al carrito
          </button>
        </div>
      </div>

      <div className="mt12">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h2 className="m0">Carrito</h2>
          <p className="m0" style={{ color: "var(--muted)" }}>
            Items: <b>{items.length}</b>
          </p>
        </div>

        {items.length === 0 ? (
          <p className="mt12">No hay items.</p>
        ) : (
          <div className="tableWrap mt12">
            <table className="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.productoId}>
                    <td>
                      {it.productoId} - {it.nombre}
                    </td>
                    <td>${it.precio}</td>

                    <td>
                      {editRowPid === it.productoId ? (
                        <input
                          className="input"
                          style={{ width: 110 }}
                          inputMode="numeric"
                          value={editCantidad}
                          onChange={(e) => setEditCantidad(e.target.value)}
                        />
                      ) : (
                        it.cantidad
                      )}
                    </td>

                    <td>${it.subtotal}</td>

                    <td>
                      {editRowPid === it.productoId ? (
                        <div className="row" style={{ alignItems: "center" }}>
                          <select
                            className="select"
                            style={{ width: "min(260px, 60vw)" }}
                            value={editProductoId}
                            onChange={(e) => setEditProductoId(e.target.value)}
                          >
                            {productos.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.id} - {p.nombre} (stock {p.stock}) - ${p.precio}
                              </option>
                            ))}
                          </select>

                          {/* Guardar y Cancelar juntos, sin wrap */}
                          <div className="rowNoWrap">
                            <button className="btn btnPrimary btnSm" type="button" onClick={guardarEdicion}>
                              Guardar
                            </button>
                            <button className="btn btnNeutral btnSm" type="button" onClick={cancelarEdicion}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="row">
                          <button className="btn btnWarning btnSm" type="button" onClick={() => iniciarEdicion(it)}>
                            Modificar
                          </button>
                          <button
                            className="btn btnDanger btnSm"
                            type="button"
                            onClick={() => quitarItem(it.productoId)}
                          >
                            Quitar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="row mt12" style={{ justifyContent: "space-between" }}>
          <h3 className="m0">Total: ${total}</h3>

          <button className="btn btnPrimary" type="button" onClick={registrarVenta} disabled={items.length === 0}>
            Registrar venta
          </button>
        </div>
      </div>
    </div>
  );
}