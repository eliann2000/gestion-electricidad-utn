import { useEffect, useMemo, useState } from "react"; //useEffect es un hook que se ejecuta cuando el componente se monta, se actualiza o se desmonta, se utiliza para cargar los productos y las marcas cuando se monta el componente
import { productosApi } from "../services/productos";
import { marcasApi } from "../services/marcas";

import ProductoForm from "../components/productos/ProductoForm";
import ProductosTable from "../components/productos/ProductosTable";

const formVacio = {
  codigo: "",
  nombre: "",
  marcaId: "",
  precio: "",
  stock: "",
  stockMinimo: "",
  activo: true,
};

export default function ProductosPage() {
  const [productos, setProductos] = useState([]); // estado para almacenar la lista de productos
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [idEditando, setIdEditando] = useState(null); // si es null se esta creando uno nuevo sino se esta editando el producto con ese id
  const [form, setForm] = useState(formVacio);

  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("activos");

  const [marcas, setMarcas] = useState([]); // estado para almacenar la lista de marcas

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

  const cargarMarcas = async () => {
    try {
      const data = await marcasApi.listar();
      setMarcas(data.filter((m) => m.activo));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    cargarProductos();
    cargarMarcas();
  }, []); //cuando se monta el componente, carga los productos y las marcas

  const onChange = (e) => { //eventos de los inputs del formulario
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value })); // si el input es checkbox, guarda true o false sino guarda el valor
  };

  const guardar = async (e) => { //e es el evento cuando se envia el formulario
    e.preventDefault();
    setError("");

    const body = {
      codigo: form.codigo.trim(),
      nombre: form.nombre.trim(),
      marcaId: form.marcaId === "" ? null : Number(form.marcaId), //porque en general lo que viene del input viene como string
      precio: Number(form.precio),
      stock: form.stock === "" ? 0 : Number(form.stock),
      stockMinimo: form.stockMinimo === "" ? 0 : Number(form.stockMinimo),
      activo: form.activo,
    };

    if (!body.codigo) return setError("El código es obligatorio");
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

  const editar = (p) => { //p es el producto que se va a editar, se carga el formulario con los datos del producto
    setIdEditando(p.id);
    setForm({
      codigo: p.codigo || "",
      nombre: p.nombre || "",
      marcaId: p.marcaId ? String(p.marcaId) : "",
      precio: String(p.precio ?? ""),
      stock: String(p.stock ?? 0),
      stockMinimo: String(p.stockMinimo ?? 0),
      activo: !!p.activo,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (p) => { //p es el producto que se va a eliminar
    if (!window.confirm(`¿Eliminar el producto "${p.nombre}"?`)) return;

    setError("");
    try {
      await productosApi.remove(p.id);
      if (idEditando === p.id) limpiar(); //si el producto que se está editando es el mismo que se eliminó, se limpia el formulario
      cargarProductos();
    } catch (e) {
      const msg = String(e?.message || "");

      setError(msg || "Error al eliminar el producto");
    }
  };

  const productosFiltrados = useMemo(() => {
    const n = filtroNombre.toLowerCase();
    const c = filtroCodigo.toLowerCase();

    return productos.filter((p) => { // p es cada producto del array productos
      const nom = (p.nombre || "").toLowerCase();
      const cod = (p.codigo || "").toLowerCase();

      const okNombre = nom.includes(n);
      const okCodigo = cod.includes(c);

      const okEstado =
        filtroEstado === "todos" ? true : filtroEstado === "activos" ? !!p.activo : !p.activo;

      return okNombre && okCodigo && okEstado;
    });
  }, [productos, filtroNombre, filtroCodigo, filtroEstado]);

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

      {error && ( //si error tiene texto viene el error
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
        marcas={marcas}
      />

      <div className="row mt12" style={{ justifyContent: "space-between" }}>
        <h2 className="m0">Listado</h2>
        {cargando && <small style={{ color: "var(--muted)" }}>Cargando...</small>}
      </div>

      <div className="row mt12" style={{ gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 240px" }}>
          <label className="label">Buscar por código</label>
          <input className="input" value={filtroCodigo} onChange={(e) => setFiltroCodigo(e.target.value)} />
        </div>

        <div style={{ flex: "1 1 240px" }}>
          <label className="label">Buscar por nombre</label>
          <input className="input" value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} />
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