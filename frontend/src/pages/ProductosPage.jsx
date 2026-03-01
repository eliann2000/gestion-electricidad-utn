import { useEffect, useState } from "react";
import { productosApi } from "../services/productos";

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    marca: "",
    categoria: "",
    precio: "",
    stock: "",
    stockMinimo: "",
    activo: true,
  });

  function resetForm() {
    setForm({
      nombre: "",
      marca: "",
      categoria: "",
      precio: "",
      stock: "",
      stockMinimo: "",
      activo: true,
    });
    setEditingId(null);
  }

  async function cargarProductos() {
    setLoading(true);
    setError("");
    try {
      const data = await productosApi.list();
      setProductos(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarProductos();
  }, []);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function buildBodyFromForm() {
    return {
      nombre: form.nombre.trim(),
      marca: form.marca.trim() || null,
      categoria: form.categoria.trim() || null,
      precio: Number(form.precio),
      stock: form.stock === "" ? 0 : Number(form.stock),
      stockMinimo: form.stockMinimo === "" ? 0 : Number(form.stockMinimo),
      activo: form.activo,
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const body = buildBodyFromForm();

    if (!body.nombre) return setError("El nombre es obligatorio");
    if (!Number.isFinite(body.precio)) return setError("Precio inválido");

    try {
      if (editingId === null) {
        await productosApi.create(body);
      } else {
        await productosApi.update(editingId, body);
      }
      resetForm();
      await cargarProductos();
    } catch (e) {
      setError(e.message);
    }
  }

  function onEditarClick(p) {
    setEditingId(p.id);
    setForm({
      nombre: p.nombre ?? "",
      marca: p.marca ?? "",
      categoria: p.categoria ?? "",
      precio: String(p.precio ?? ""),
      stock: String(p.stock ?? 0),
      stockMinimo: String(p.stockMinimo ?? 0),
      activo: !!p.activo,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onEliminarClick(p) {
    const ok = window.confirm(`¿Eliminar el producto "${p.nombre}" (ID ${p.id})?`);
    if (!ok) return;

    setError("");
    try {
      await productosApi.remove(p.id);
      await cargarProductos();
      if (editingId === p.id) resetForm();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="m0">Productos</h1>
          <p className="m0" style={{ color: "var(--muted)", marginTop: 6 }}>
            Total: <b>{productos.length}</b>
          </p>
        </div>

        <button className="btn" type="button" onClick={cargarProductos} disabled={loading}>
          Refrescar
        </button>
      </div>

      {error && (
        <div className="alert alertError mt12">
          <b>Error:</b> {error}
        </div>
      )}

      <div className="mt12 card cardFlat">
        <h2 className="cardTitle">
          {editingId === null ? "Nuevo producto" : `Editando producto ID ${editingId}`}
        </h2>

        <form onSubmit={onSubmit}>
          <div className="grid2">
            <div>
              <label className="label">Nombre *</label>
              <input
                className="input"
                name="nombre"
                value={form.nombre}
                onChange={onChange}
                placeholder="Ej: Lámpara LED"
              />
            </div>

            <div>
              <label className="label">Precio *</label>
              <input
                className="input"
                name="precio"
                value={form.precio}
                onChange={onChange}
                placeholder="Ej: 3500"
                inputMode="decimal"
              />
            </div>

            <div>
              <label className="label">Marca</label>
              <input
                className="input"
                name="marca"
                value={form.marca}
                onChange={onChange}
                placeholder="Ej: Ferrolux"
              />
            </div>

            <div>
              <label className="label">Categoría</label>
              <input
                className="input"
                name="categoria"
                value={form.categoria}
                onChange={onChange}
                placeholder="Ej: Iluminación"
              />
            </div>

            <div>
              <label className="label">Stock</label>
              <input
                className="input"
                name="stock"
                value={form.stock}
                onChange={onChange}
                placeholder="Ej: 10"
                inputMode="numeric"
              />
            </div>

            <div>
              <label className="label">Stock mínimo</label>
              <input
                className="input"
                name="stockMinimo"
                value={form.stockMinimo}
                onChange={onChange}
                placeholder="Ej: 3"
                inputMode="numeric"
              />
            </div>
          </div>

          <div className="row mt12" style={{ justifyContent: "space-between" }}>
            <label className="checkboxRow">
              <input type="checkbox" name="activo" checked={form.activo} onChange={onChange} />
              Activo
            </label>

            <div className="row">
              <button className="btn btnPrimary" type="submit">
                {editingId === null ? "Crear" : "Guardar cambios"}
              </button>

              {editingId !== null && (
                <button className="btn btnGhost" type="button" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="row mt12" style={{ justifyContent: "space-between" }}>
        <h2 className="m0">Listado</h2>
        {loading && <small style={{ color: "var(--muted)" }}>Cargando...</small>}
      </div>

      {!loading && productos.length === 0 ? (
        <p className="mt12">No hay productos.</p>
      ) : (
        <div className="tableWrap mt12">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Marca</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Mín</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.nombre}</td>
                  <td>{p.marca ?? "-"}</td>
                  <td>{p.categoria ?? "-"}</td>
                  <td>${p.precio}</td>
                  <td>{p.stock}</td>
                  <td>{p.stockMinimo}</td>
                  <td>{p.activo ? "Sí" : "No"}</td>
                  <td>
                    <div className="row">
                      <button className="btn btnSm" type="button" onClick={() => onEditarClick(p)}>
                        Editar
                      </button>
                      <button className="btn btnDanger btnSm" type="button" onClick={() => onEliminarClick(p)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan="9">Cargando...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}