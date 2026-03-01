import { useEffect, useState } from "react";
import { clientesApi } from "../services/clientes";

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    activo: true,
  });

  function resetForm() {
    setForm({
      nombre: "",
      telefono: "",
      email: "",
      direccion: "",
      activo: true,
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
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function buildBodyFromForm() {
    return {
      nombre: form.nombre.trim(),
      telefono: form.telefono.trim() || null,
      email: form.email.trim() || null,
      direccion: form.direccion.trim() || null,
      activo: form.activo,
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    const body = buildBodyFromForm();
    if (!body.nombre) return setError("El nombre es obligatorio");

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
      telefono: c.telefono ?? "",
      email: c.email ?? "",
      direccion: c.direccion ?? "",
      activo: !!c.activo,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onEliminarClick(c) {
    const ok = window.confirm(`¿Eliminar el cliente "${c.nombre}" (ID ${c.id})?`);
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

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="m0">Clientes</h1>
          <p className="m0" style={{ color: "var(--muted)", marginTop: 6 }}>
            Total: <b>{clientes.length}</b>
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
                placeholder="Ej: Juan Pérez"
                value={form.nombre}
                onChange={onChange}
              />
            </div>

            <div>
              <label className="label">Teléfono</label>
              <input
                className="input"
                name="telefono"
                placeholder="Ej: 3515551234"
                value={form.telefono}
                onChange={onChange}
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                className="input"
                name="email"
                placeholder="Ej: juan@gmail.com"
                value={form.email}
                onChange={onChange}
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

      {!loading && clientes.length === 0 ? (
        <p className="mt12">No hay clientes.</p>
      ) : (
        <div className="tableWrap mt12">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Dirección</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.nombre}</td>
                  <td>{c.telefono ?? "-"}</td>
                  <td>{c.email ?? "-"}</td>
                  <td>{c.direccion ?? "-"}</td>
                  <td>{c.activo ? "Sí" : "No"}</td>
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
                  <td colSpan="7">Cargando...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}