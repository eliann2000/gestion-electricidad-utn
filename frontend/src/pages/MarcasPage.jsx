import { useEffect, useState } from "react";
import { marcasApi } from "../services/marcas";

export default function MarcasPage() {
    const [marcas, setMarcas] = useState([]);
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [paginaWeb, setPaginaWeb] = useState("");
    const [activo, setActivo] = useState(true);

    const [idEditando, setIdEditando] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    async function cargarMarcas() {
        try {
            setCargando(true);
            setError("");
            const data = await marcasApi.listar();
            setMarcas(data);
        } catch (e) {
            setError(e.message || "Error al cargar marcas");
        } finally {
            setCargando(false);
        }
    }

    useEffect(() => {
        cargarMarcas();
    }, []);

    function limpiar() {
        setNombre("");
        setDescripcion("");
        setPaginaWeb("");
        setActivo(true);
        setIdEditando(null);
    }

    async function guardar(e) {
        e.preventDefault();
        setError("");

        if (!nombre.trim()) {
            setError("El nombre es obligatorio");
            return;
        }

        try {
            setGuardando(true);

            const data = {
                nombre: nombre.trim(),
                descripcion: descripcion.trim() || null,
                paginaWeb: paginaWeb.trim() || null,
                activo,
            };

            if (idEditando) {
                await marcasApi.actualizar(idEditando, data);
            } else {
                await marcasApi.crear(data);
            }

            limpiar();
            cargarMarcas();
        } catch (e) {
            setError(e.message || "Error al guardar marca");
        } finally {
            setGuardando(false);
        }
    }

    function editar(marca) {
        setIdEditando(marca.id);
        setNombre(marca.nombre || "");
        setDescripcion(marca.descripcion || "");
        setPaginaWeb(marca.paginaWeb || "");
        setActivo(!!marca.activo);
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function eliminar(id) {
        const confirmar = window.confirm("¿Seguro que querés eliminar esta marca?");
        if (!confirmar) return;

        try {
            setError("");
            await marcasApi.eliminar(id);

            if (idEditando === id) {
                limpiar();
            }

            cargarMarcas();
        } catch (e) {
            setError(e.message || "Error al eliminar marca");
        }
    }

    return (
        <div className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                    <h1 className="m0">Marcas</h1>
                    <p className="m0" style={{ color: "var(--muted)", marginTop: 6 }}>
                        Total: <b>{marcas.length}</b>
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
                    {idEditando ? `Editando marca ID ${idEditando}` : "Nueva marca"}
                </h2>

                <form onSubmit={guardar}>
                    <div className="grid2">
                        <div>
                            <label className="label">Nombre *</label>
                            <input
                                className="input"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: Philips"
                            />
                        </div>

                        <div>
                            <label className="label">Página web</label>
                            <input
                                className="input"
                                value={paginaWeb}
                                onChange={(e) => setPaginaWeb(e.target.value)}
                                placeholder="Ej: https://www.marca.com"
                            />
                        </div>

                        <div style={{ gridColumn: "1 / -1" }}>
                            <label className="label">Descripción</label>
                            <input
                                className="input"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Ej: Marca de productos electrónicos"
                            />
                        </div>
                    </div>

                    <div className="row mt12" style={{ justifyContent: "space-between" }}>
                        <label className="checkboxRow">
                            <input
                                type="checkbox"
                                checked={activo}
                                onChange={(e) => setActivo(e.target.checked)}
                            />
                            Activa
                        </label>

                        <div className="row">
                            <button className="btn btnPrimary" type="submit" disabled={guardando}>
                                {guardando ? "Guardando..." : idEditando ? "Guardar cambios" : "Crear"}
                            </button>

                            <button className="btn btnNeutral" type="button" onClick={limpiar}>
                                {idEditando ? "Cancelar" : "Limpiar"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className="row mt12" style={{ justifyContent: "space-between" }}>
                <h2 className="m0">Listado</h2>
                {cargando && <small style={{ color: "var(--muted)" }}>Cargando...</small>}
            </div>

            {!cargando && marcas.length === 0 ? (
                <p className="mt12">No hay marcas cargadas.</p>
            ) : (
                <div className="tableWrap mt12">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Descripción</th>
                                <th>Página web</th>
                                <th>Activa</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {marcas.map((m) => (
                                <tr key={m.id}>
                                    <td>{m.id}</td>
                                    <td>{m.nombre}</td>
                                    <td>{m.descripcion || "-"}</td>
                                    <td>{m.paginaWeb || "-"}</td>
                                    <td>{m.activo ? "Sí" : "No"}</td>
                                    <td>
                                        <div className="row">
                                            <button className="btn btnPrimary btnSm" type="button" onClick={() => editar(m)}>
                                                Editar
                                            </button>
                                            <button
                                                className="btn btnDanger btnSm"
                                                type="button"
                                                onClick={() => eliminar(m.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {cargando && (
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