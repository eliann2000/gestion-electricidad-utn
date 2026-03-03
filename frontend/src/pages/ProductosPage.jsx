import { useEffect, useMemo, useState } from "react";
import { productosApi } from "../services/productos";

import ProductoForm from "../components/productos/ProductoForm";
import ProductosTable from "../components/productos/ProductosTable";

const initialForm = {
  nombre: "",
  marca: "",
  categoria: "",
  precio: "",
  stock: "",
  stockMinimo: "",
  activo: true,
};

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos"); // todos | activos | inactivos

  function resetForm() {
    setForm(initialForm);
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
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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
    if (!Number.isFinite(body.precio) || body.precio < 0) return setError("El precio debe ser 0 o mayor");
    if (!Number.isFinite(body.stock) || body.stock < 0) return setError("El stock debe ser un número mayor o igual a 0");
    if (!Number.isFinite(body.stockMinimo) || body.stockMinimo < 0)
      return setError("El stock mínimo debe ser un número mayor o igual a 0");

    try {
      if (editingId === null) await productosApi.create(body);
      else await productosApi.update(editingId, body);

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
      const msg = String(e?.message || "");

      if (msg.includes("403") || msg.includes("Solo ADMIN")) {
        return setError("No tenés permisos para eliminar productos. Solo un ADMIN puede hacerlo.");
      }

      if (
        msg.includes("No se puede eliminar este producto") ||
        msg.includes("P2003") ||
        msg.toLowerCase().includes("foreign key") ||
        msg.toLowerCase().includes("constraint")
      ) {
        return setError("No se puede eliminar este producto porque ya fue utilizado en una venta. ");
      }

      setError(msg || "Error al eliminar el producto");
    }
  }

  const productosFiltrados = useMemo(() => {
    const n = filtroNombre.toLowerCase();
    const m = filtroMarca.toLowerCase();

    return productos.filter((p) => {
      const nombre = (p.nombre ?? "").toLowerCase();
      const marca = (p.marca ?? "").toLowerCase();

      const okNombre = nombre.includes(n);
      const okMarca = marca.includes(m);

      const okEstado =
        filtroEstado === "todos" ? true : filtroEstado === "activos" ? !!p.activo : !p.activo;

      return okNombre && okMarca && okEstado;
    });
  }, [productos, filtroNombre, filtroMarca, filtroEstado]);

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="m0">Productos</h1>
          <p className="m0" style={{ color: "var(--muted)", marginTop: 6 }}>
            Total: <b>{productos.length}</b>
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alertError mt12">
          <b>Error:</b> {error}
        </div>
      )}

      <ProductoForm
        editingId={editingId}
        form={form}
        onChange={onChange}
        onSubmit={onSubmit}
        resetForm={resetForm}
      />

      <div className="row mt12" style={{ justifyContent: "space-between" }}>
        <h2 className="m0">Listado</h2>
        {loading && <small style={{ color: "var(--muted)" }}>Cargando...</small>}
      </div>

      <div className="row mt12" style={{ gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 240px" }}>
          <label className="label">Buscar por nombre</label>
          <input className="input" value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} />
        </div>

        <div style={{ flex: "1 1 240px" }}>
          <label className="label">Buscar por marca</label>
          <input className="input" value={filtroMarca} onChange={(e) => setFiltroMarca(e.target.value)} />
        </div>

        <div style={{ flex: "0 0 220px" }}>
          <label className="label">Estado</label>
          <select className="select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
        </div>
      </div>

      <ProductosTable
        productos={productosFiltrados}
        loading={loading}
        onEditarClick={onEditarClick}
        onEliminarClick={onEliminarClick}
      />
    </div>
  );
}