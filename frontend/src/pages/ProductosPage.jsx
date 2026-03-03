import { useEffect, useMemo, useState } from "react";
import { productosApi } from "../services/productos";

import ProductoForm from "../components/productos/ProductoForm";
import ProductosTable from "../components/productos/ProductosTable";

const formVacio = {
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
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [idEditando, setIdEditando] = useState(null);
  const [form, setForm] = useState(formVacio);

  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos"); // todos | activos | inactivos

  const limpiar = () => {
    setForm(formVacio);
    setIdEditando(null);
  };

  const cargarProductos = async () => {
    setCargando(true);
    setError("");
    try {
      setProductos(await productosApi.list());
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const guardar = async (e) => {
    e.preventDefault();
    setError("");

    const body = {
      nombre: form.nombre.trim(),
      marca: form.marca.trim() || null,
      categoria: form.categoria.trim() || null,
      precio: Number(form.precio),
      stock: form.stock === "" ? 0 : Number(form.stock),
      stockMinimo: form.stockMinimo === "" ? 0 : Number(form.stockMinimo),
      activo: form.activo,
    };

    if (!body.nombre) return setError("El nombre es obligatorio");
    if (!Number.isFinite(body.precio) || body.precio < 0) return setError("El precio debe ser 0 o mayor");
    if (!Number.isFinite(body.stock) || body.stock < 0) return setError("El stock debe ser 0 o mayor");
    if (!Number.isFinite(body.stockMinimo) || body.stockMinimo < 0) return setError("El stock mínimo debe ser 0 o mayor");

    try {
      await (idEditando ? productosApi.update(idEditando, body) : productosApi.create(body));
      limpiar();
      cargarProductos();
    } catch (e) {
      setError(e.message);
    }
  };

  const editar = (p) => {
    setIdEditando(p.id);
    setForm({
      nombre: p.nombre || "",
      marca: p.marca || "",
      categoria: p.categoria || "",
      precio: String(p.precio ?? ""),
      stock: String(p.stock ?? 0),
      stockMinimo: String(p.stockMinimo ?? 0),
      activo: !!p.activo,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (p) => {
    if (!window.confirm(`¿Eliminar el producto "${p.nombre}" (ID ${p.id})?`)) return;

    setError("");
    try {
      await productosApi.remove(p.id);
      if (idEditando === p.id) limpiar();
      cargarProductos();
    } catch (e) {
      const msg = String(e?.message || "");

      if (msg.includes("403") || msg.toLowerCase().includes("admin")) {
        return setError("No tenés permisos para eliminar productos. Solo un ADMIN puede hacerlo.");
      }

      if (msg.includes("P2003") || msg.toLowerCase().includes("foreign key") || msg.toLowerCase().includes("constraint")) {
        return setError("No se puede eliminar este producto porque ya fue utilizado en una venta.");
      }

      setError(msg || "Error al eliminar el producto");
    }
  };

  const productosFiltrados = useMemo(() => {
    const n = filtroNombre.toLowerCase();
    const m = filtroMarca.toLowerCase();

    return productos.filter((p) => {
      const nom = (p.nombre || "").toLowerCase();
      const mar = (p.marca || "").toLowerCase();

      const okNombre = nom.includes(n);
      const okMarca = mar.includes(m);

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
        idEditando={idEditando}
        form={form}
        onChange={onChange}
        onSubmit={guardar}
        limpiar={limpiar}
      />

      <div className="row mt12" style={{ justifyContent: "space-between" }}>
        <h2 className="m0">Listado</h2>
        {cargando && <small style={{ color: "var(--muted)" }}>Cargando...</small>}
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
        cargando={cargando}
        editar={editar}
        eliminar={eliminar}
      />
    </div>
  );
}