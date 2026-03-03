import { useEffect, useMemo, useState } from "react";
import { clientesApi } from "../services/clientes";

import ClienteForm from "../components/clientes/ClienteForm";
import ClientesTable from "../components/clientes/ClientesTable";
import ClientesHeader from "../components/clientes/ClientesHeader";

const formVacio = {
  nombre: "",
  apellido: "",
  telefono: "",
  email: "",
  direccion: "",
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [idEditando, setIdEditando] = useState(null);
  const [form, setForm] = useState(formVacio);

  const [filtro, setFiltro] = useState("");

  const limpiar = () => {
    setForm(formVacio);
    setIdEditando(null);
  };

  const traerClientes = async () => {
    setCargando(true);
    setError("");
    try {
      const data = await clientesApi.list();
      setClientes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    traerClientes();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const armarBody = () => ({
    nombre: form.nombre.trim(),
    apellido: form.apellido.trim(),
    telefono: form.telefono.trim(),
    email: form.email.trim(),
    direccion: form.direccion.trim() || null,
  });

  const validar = (b) => {
    if (!b.nombre) return "El nombre es obligatorio";
    if (!b.apellido) return "El apellido es obligatorio";
    if (!b.telefono) return "El teléfono es obligatorio";
    if (!b.email) return "El email es obligatorio";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const body = armarBody();
    const msg = validar(body);
    if (msg) return setError(msg);

    try {
      if (idEditando === null) await clientesApi.create(body);
      else await clientesApi.update(idEditando, body);

      limpiar();
      traerClientes();
    } catch (e) {
      setError(e.message);
    }
  };

  const editar = (c) => {
    setIdEditando(c.id);
    setForm({
      nombre: c.nombre || "",
      apellido: c.apellido || "",
      telefono: c.telefono || "",
      email: c.email || "",
      direccion: c.direccion || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const eliminar = async (c) => {
    const ok = window.confirm(`¿Eliminar el cliente "${c.nombre} ${c.apellido}" (ID ${c.id})?`);
    if (!ok) return;

    setError("");
    try {
      await clientesApi.remove(c.id);
      traerClientes();
      if (idEditando === c.id) limpiar();
    } catch (e) {
      const msg = String(e?.message || "");
      if (msg.includes("403") || msg.toLowerCase().includes("admin")) {
        setError("No tenés permisos para eliminar clientes. Solo un ADMIN puede hacerlo.");
      } else {
        setError(msg);
      }
    }
  };

  const clientesFiltrados = useMemo(() => {
    const f = filtro.toLowerCase();
    return clientes.filter((c) => `${c.nombre || ""} ${c.apellido || ""}`.toLowerCase().includes(f));
  }, [clientes, filtro]);

  return (
    <div className="card">
      <ClientesHeader total={clientesFiltrados.length} />

      {error && (
        <div className="alert alertError mt12">
          <b>Error:</b> {error}
        </div>
      )}

      <ClienteForm
        idEditando={idEditando}
        form={form}
        cambiar={onChange}
        guardar={onSubmit}
        limpiar={limpiar}
      />

      {/* ✅ AHORA va abajo */}
      <div className="row mt12" style={{ justifyContent: "space-between" }}>
        <h2 className="m0">Listado</h2>
        {cargando && <small style={{ color: "var(--muted)" }}>Cargando...</small>}
      </div>

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

      <ClientesTable
        clientes={clientesFiltrados}
        cargando={cargando}
        editar={editar}
        eliminar={eliminar}
      />
    </div>
  );
}