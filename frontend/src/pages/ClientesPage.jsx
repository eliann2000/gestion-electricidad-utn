import { useEffect, useMemo, useState } from "react";
import { clientesApi } from "../services/clientes";

import ClienteForm from "../components/clientes/ClienteForm";
import ClientesToolbar from "../components/clientes/ClientesToolbar";
import ClientesTable from "../components/clientes/ClientesTable";
import ClientesListadoHeader from "../components/clientes/ClientesListadoHeader";

const initialForm = {
  nombre: "",
  apellido: "",
  telefono: "",
  email: "",
  direccion: "",
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [filtro, setFiltro] = useState("");

  function resetForm() {
    setForm(initialForm);
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
    setForm((prev) => ({ ...prev, [name]: value }));
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
      if (editingId === null) await clientesApi.create(body);
      else await clientesApi.update(editingId, body);

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
      const msg = String(e?.message || "");
      if (msg.includes("403") || msg.includes("Solo ADMIN")) {
        return setError("No tenés permisos para eliminar clientes. Solo un ADMIN puede hacerlo.");
      }
      setError(msg);
    }
  }

  const clientesFiltrados = useMemo(() => {
    const filtroLower = filtro.toLowerCase();
    return clientes.filter((c) => {
      const texto = `${c.nombre ?? ""} ${c.apellido ?? ""}`.toLowerCase();
      return texto.includes(filtroLower);
    });
  }, [clientes, filtro]);

  return (
    <div className="card">
      <ClientesToolbar total={clientesFiltrados.length} />

      {error && (
        <div className="alert alertError mt12">
          <b>Error:</b> {error}
        </div>
      )}

      <ClienteForm
        editingId={editingId}
        form={form}
        onChange={onChange}
        onSubmit={onSubmit}
        resetForm={resetForm}
      />

      <ClientesListadoHeader
        loading={loading}
        filtro={filtro}
        setFiltro={setFiltro}
      />

      <ClientesTable
        clientes={clientesFiltrados}
        loading={loading}
        onEditarClick={onEditarClick}
        onEliminarClick={onEliminarClick}
      />
    </div>
  );
}