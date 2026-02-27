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
    if (!Number.isFinite(body.stock) || body.stock < 0) return setError("Stock inválido");
    if (!Number.isFinite(body.stockMinimo) || body.stockMinimo < 0) return setError("Stock mínimo inválido");

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
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Productos</h1>

      {error && (
        <div style={{ marginBottom: 12, color: "crimson" }}>
          <b>Error:</b> {error}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ marginBottom: 16 }}>
        <h2>{editingId === null ? "Nuevo producto" : `Editando producto ID ${editingId}`}</h2>

        <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
          <input name="nombre" placeholder="Nombre *" value={form.nombre} onChange={onChange} />
          <input name="marca" placeholder="Marca" value={form.marca} onChange={onChange} />
          <input name="categoria" placeholder="Categoría" value={form.categoria} onChange={onChange} />
          <input name="precio" placeholder="Precio *" value={form.precio} onChange={onChange} inputMode="decimal" />
          <input name="stock" placeholder="Stock" value={form.stock} onChange={onChange} inputMode="numeric" />
          <input
            name="stockMinimo"
            placeholder="Stock mínimo"
            value={form.stockMinimo}
            onChange={onChange}
            inputMode="numeric"
          />

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" name="activo" checked={form.activo} onChange={onChange} />
            Activo
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit">{editingId === null ? "Crear" : "Guardar cambios"}</button>
            {editingId !== null && (
              <button type="button" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      <h2>Listado</h2>

      {loading ? (
        <p>Cargando...</p>
      ) : productos.length === 0 ? (
        <p>No hay productos.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Min</th>
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
                <td>{p.precio}</td>
                <td>{p.stock}</td>
                <td>{p.stockMinimo}</td>
                <td>{p.activo ? "Sí" : "No"}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => onEditarClick(p)}>
                    Editar
                  </button>
                  <button type="button" onClick={() => onEliminarClick(p)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}