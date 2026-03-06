import { useEffect, useMemo, useState } from "react";
import { clientesApi } from "../services/clientes";
import { productosApi } from "../services/productos";
import { ventasApi } from "../services/ventas";

import CarritoTable from "../components/ventas/CarritoTable";

export default function NuevaVentaPage() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);

  const [clienteId, setClienteId] = useState("");
  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("1");

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const [enviarEmail, setEnviarEmail] = useState(false);

  // edición carrito (nombres simples)
  const [idItemEdit, setIdItemEdit] = useState(null); // id del producto de la fila que edito
  const [prodEdit, setProdEdit] = useState("");
  const [cantEdit, setCantEdit] = useState("1");

  const limpiarMsgs = () => {
    setError("");
    setOkMsg("");
  };

  const resetEdicion = () => {
    setIdItemEdit(null);
    setProdEdit("");
    setCantEdit("1");
  };

  const buscarProd = (id) => productos.find((p) => p.id === id);

  const cargarData = async () => {
    setLoading(true);
    setError("");
    try {
      const [c, p] = await Promise.all([clientesApi.list(), productosApi.list()]);

      setClientes(
        [...c].sort((a, b) =>
          `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`, "es")
        )
      );

      setProductos(p.filter((x) => x.activo));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarData();
  }, []);

  const total = useMemo(() => items.reduce((acc, it) => acc + it.subtotal, 0), [items]);

  const agregarItem = () => {
    limpiarMsgs();

    const idProd = Number(productoId);
    const cant = Number(cantidad);

    if (!idProd) return setError("Elegí un producto");
    if (!Number.isFinite(cant) || cant <= 0) return setError("Cantidad inválida");

    const prod = buscarProd(idProd);
    if (!prod) return setError("Producto no encontrado");

    const precio = Number(prod.precio);
    const yaEnCarrito = items.find((x) => x.productoId === idProd);
    const cantFinal = (yaEnCarrito?.cantidad || 0) + cant;

    if (cantFinal > prod.stock) return setError(`Stock insuficiente. Disponible: ${prod.stock}`);

    setItems((prev) => {
      if (yaEnCarrito) {
        return prev.map((x) =>
          x.productoId === idProd ? { ...x, cantidad: cantFinal, subtotal: precio * cantFinal } : x
        );
      }
      return [...prev, { productoId: idProd, nombre: prod.nombre, precio, cantidad: cant, subtotal: precio * cant }];
    });

    setProductoId("");
    setCantidad("1");
  };

  const quitarItem = (idProd) => {
    if (idItemEdit === idProd) resetEdicion();
    setItems((prev) => prev.filter((x) => x.productoId !== idProd));
  };

  const iniciarEdicion = (it) => {
    limpiarMsgs();
    setIdItemEdit(it.productoId);
    setProdEdit(String(it.productoId));
    setCantEdit(String(it.cantidad));
  };

  const guardarEdicion = () => {
    limpiarMsgs();

    const idViejo = idItemEdit;
    const idNuevo = Number(prodEdit);
    const cantNueva = Number(cantEdit);

    if (!idViejo) return;
    if (!idNuevo) return setError("Elegí un producto");
    if (!Number.isFinite(cantNueva) || cantNueva <= 0) return setError("Cantidad inválida");

    const prod = buscarProd(idNuevo);
    if (!prod) return setError("Producto no encontrado");
    if (cantNueva > prod.stock) return setError(`Stock insuficiente. Disponible: ${prod.stock}`);

    // si cambio a un producto que ya estaba, se fusiona
    const yaEnCarrito = items.find((x) => x.productoId === idNuevo && x.productoId !== idViejo);
    if (yaEnCarrito && yaEnCarrito.cantidad + cantNueva > prod.stock) {
      return setError(`No se puede fusionar: stock insuficiente. Disponible: ${prod.stock}`);
    }

    const precio = Number(prod.precio);

    setItems((prev) => {
      const sinViejo = prev.filter((x) => x.productoId !== idViejo);
      const existe = sinViejo.find((x) => x.productoId === idNuevo);

      if (existe) {
        const fusion = existe.cantidad + cantNueva;
        return sinViejo.map((x) =>
          x.productoId === idNuevo ? { ...x, cantidad: fusion, subtotal: Number(x.precio) * fusion } : x
        );
      }

      return [...sinViejo, { productoId: idNuevo, nombre: prod.nombre, precio, cantidad: cantNueva, subtotal: precio * cantNueva }]
        .sort((a, b) => a.productoId - b.productoId);
    });

    resetEdicion();
  };

  const registrarVenta = async () => {
    limpiarMsgs();
    if (items.length === 0) return setError("Agregá al menos un producto");

    const body = {
      clienteId: clienteId ? Number(clienteId) : null,
      items: items.map((it) => ({ productoId: it.productoId, cantidad: it.cantidad })),
    };

    try {
      const venta = await ventasApi.create(body);

      if (enviarEmail) {
        let to;
        if (!clienteId) {
          to = window.prompt("Ingresá el email destino para enviar el comprobante:");
          if (!to) throw new Error("No se envió el correo: no ingresaste email destino.");
        }

        const resp = await fetch(`http://localhost:3001/api/ventas/${venta.id}/enviar-correo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(to ? { to } : {}),
        });

        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) throw new Error(data.message || "Error enviando correo");
      }

      setOkMsg(
        enviarEmail
          ? `Venta creada (ID ${venta.id}) - Total: ${venta.total}. Correo enviado ✅`
          : `Venta creada (ID ${venta.id}) - Total: ${venta.total}`
      );

      setItems([]);
      setClienteId("");
      resetEdicion();
      setEnviarEmail(false);
      cargarData();
    } catch (e) {
      setError(e.message);
    }
  };

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
          <option value="">Consumidor final</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id} - {c.apellido} {c.nombre}
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
              type="number"
              min="1"
              step="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ej: 1"
            />
          </div>
        </div>

        <div className="row mt12" style={{ justifyContent: "flex-end" }}>
          <button className="btn btnPrimary" type="button" onClick={agregarItem}>
            Agregar al carrito
          </button>
        </div>
      </div>

      {/* si CarritoTable usa otros nombres, después se ajusta */}
      <CarritoTable
        items={items}
        productos={productos}
        idItemEdit={idItemEdit}
        prodEdit={prodEdit}
        cantEdit={cantEdit}
        setProdEdit={setProdEdit}
        setCantEdit={setCantEdit}
        editar={iniciarEdicion}
        guardar={guardarEdicion}
        cancelar={resetEdicion}
        quitar={quitarItem}
      />

      <div className="row mt12" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h3 className="m0">Total: ${total}</h3>

        <div className="row" style={{ gap: 12, alignItems: "center" }}>
          <label className="checkboxRow">
            <input
              type="checkbox"
              checked={enviarEmail}
              onChange={(e) => setEnviarEmail(e.target.checked)}
              disabled={items.length === 0}
            />
            Enviar comprobante por email
          </label>

          <button className="btn btnPrimary" type="button" onClick={registrarVenta} disabled={items.length === 0}>
            Registrar venta
          </button>
        </div>
      </div>
    </div>
  );
}