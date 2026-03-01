import { useEffect, useState } from "react";
import { clientesApi } from "../services/clientes";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    direccion: "",
  });

  // ✅ buscador
  const [filtro, setFiltro] = useState("");

  function resetForm() {
    setForm({
      nombre: "",
      apellido: "",
      telefono: "",
      email: "",
      direccion: "",
    });
    setEditingId(null);
  }

  async function cargarClientes() {
    setLoading(true);
    setError("");
    try {
      const data = await clientesApi.list();
      setClientes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarClientes();
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function buildBodyFromForm() {
    return {
      nombre: form.nombre.trim(),
      apellido: form.apellido.trim(),
      telefono: form.telefono.trim(),
      email: form.email.trim(),
      direccion: form.direccion.trim() || null,
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const body = buildBodyFromForm();

    if (!body.nombre) return setError("El nombre es obligatorio");
    if (!body.apellido) return setError("El apellido es obligatorio");
    if (!body.telefono) return setError("El teléfono es obligatorio");
    if (!body.email) return setError("El email es obligatorio");

    try {
      if (editingId === null) {
        await clientesApi.create(body);
      } else {
        await clientesApi.update(editingId, body);
      }
      resetForm();
      await cargarClientes();
    } catch (e) {
      setError(e.message);
    }
  }

  function onEditarClick(c) {
    setEditingId(c.id);
    setForm({
      nombre: c.nombre ?? "",
      apellido: c.apellido ?? "",
      telefono: c.telefono ?? "",
      email: c.email ?? "",
      direccion: c.direccion ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onEliminarClick(c) {
    const ok = window.confirm(`¿Eliminar el cliente "${c.nombre} ${c.apellido}" (ID ${c.id})?`);
    if (!ok) return;

    setError("");
    try {
      await clientesApi.remove(c.id);
      await cargarClientes();
      if (editingId === c.id) resetForm();
    } catch (e) {
      setError(e.message);
    }
  }

  // ✅ lista filtrada por nombre/apellido
  const clientesFiltrados = clientes.filter((c) => {
    const texto = `${c.nombre ?? ""} ${c.apellido ?? ""}`.toLowerCase();
    return texto.includes(filtro.toLowerCase());
  });

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="m0">Clientes</h1>
          <p className="m0" style={{ color: "var(--muted)", marginTop: 6 }}>
            Total: <b>{clientesFiltrados.length}</b>
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alertError mt12">
          <b>Error:</b> {error}
        </div>
      )}

      <div className="mt12 card cardFlat">
        <h2 className="cardTitle">
          {editingId === null ? "Nuevo cliente" : `Editando cliente ID ${editingId}`}
        </h2>

        <form onSubmit={onSubmit}>
          <div className="grid2">
            <div>
              <label className="label">Nombre *</label>
              <input
                className="input"
                name="nombre"
                placeholder="Ej: Juan"
                value={form.nombre}
                onChange={onChange}
              />
            </div>

            <div>
              <label className="label">Apellido *</label>
              <input
                className="input"
                name="apellido"
                placeholder="Ej: Pérez"
                value={form.apellido}
                onChange={onChange}
              />
            </div>

            <div>
              <label className="label">Teléfono *</label>
              <input
                className="input"
                name="telefono"
                placeholder="Ej: 3515551234"
                value={form.telefono}
                onChange={onChange}
                inputMode="numeric"
              />
            </div>

            <div>
              <label className="label">Email *</label>
              <input
                className="input"
                name="email"
                placeholder="Ej: juan@gmail.com"
                value={form.email}
                onChange={onChange}
                inputMode="email"
              />
            </div>

            <div>
              <label className="label">Dirección</label>
              <input
                className="input"
                name="direccion"
                placeholder="Ej: Córdoba"
                value={form.direccion}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="row mt12" style={{ justifyContent: "flex-end" }}>
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

      {/* ✅ buscador */}
      <div className="row mt12" style={{ gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 280px" }}>
          <label className="label">Buscar por nombre o apellido</label>
          <input
            className="input"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Ej: juan o pérez"
          />
        </div>
      </div>

      {!loading && clientesFiltrados.length === 0 ? (
        <p className="mt12">No hay clientes que coincidan con la búsqueda.</p>
      ) : (
        <div className="tableWrap mt12">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    {c.nombre} {c.apellido}
                  </td>
                  <td>{c.telefono}</td>
                  <td>{c.email}</td>
                  <td>{c.direccion ?? "-"}</td>
                  <td>
                    <div className="row">
                      <button className="btn btnSm" type="button" onClick={() => onEditarClick(c)}>
                        Editar
                      </button>
                      <button className="btn btnDanger btnSm" type="button" onClick={() => onEliminarClick(c)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {loading && (
                <tr>
                  <td colSpan="6">Cargando...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}