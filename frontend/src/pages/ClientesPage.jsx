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
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Clientes</h1>

      {error && (
        <div style={{ marginBottom: 12, color: "crimson" }}>
          <b>Error:</b> {error}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ marginBottom: 16 }}>
        <h2>{editingId === null ? "Nuevo cliente" : `Editando cliente ID ${editingId}`}</h2>

        <div style={{ display: "grid", gap: 8, maxWidth: 420 }}>
          <input name="nombre" placeholder="Nombre *" value={form.nombre} onChange={onChange} />
          <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={onChange} />
          <input name="email" placeholder="Email" value={form.email} onChange={onChange} />
          <input name="direccion" placeholder="Dirección" value={form.direccion} onChange={onChange} />

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
      ) : clientes.length === 0 ? (
        <p>No hay clientes.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
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
                <td style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => onEditarClick(c)}>
                    Editar
                  </button>
                  <button type="button" onClick={() => onEliminarClick(c)}>
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