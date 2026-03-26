import { useEffect, useState } from "react";
import { marcasApi } from "../services/marcas";
import MarcaForm from "../components/marcas/MarcaForm";
import MarcasTable from "../components/marcas/MarcasTable";

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
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("activas");

    async function cargarMarcas() {
        try {
            setCargando(true);
            setError("");
            const marcasTraidas = await marcasApi.listar();
            setMarcas(marcasTraidas);
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

        const marca = {
            nombre: nombre.trim(),
            descripcion: descripcion.trim() || null,
            paginaWeb: paginaWeb.trim() || null,
            activo,
        };

        try {
            setGuardando(true);

            if (idEditando) {
                await marcasApi.actualizar(idEditando, marca);
            } else {
                await marcasApi.crear(marca);
            }

            limpiar();
            cargarMarcas();
        } catch (e) {
            setError(e.message || "Error al guardar marca");
        } finally {
            setGuardando(false);
        }
    }

    function editar(marca) { // trae los datos de la marca que se quiere editar
        setIdEditando(marca.id);
        setNombre(marca.nombre || "");
        setDescripcion(marca.descripcion || "");
        setPaginaWeb(marca.paginaWeb || "");
        setActivo(!!marca.activo);
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function eliminar(id) {
        const ok = window.confirm("¿Seguro que querés eliminar esta marca?");
        if (!ok) return;

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

    const marcasFiltradas = marcas.filter((marca) => {
        const coincideNombre = (marca.nombre || "").toLowerCase().includes(busqueda.toLowerCase());

        const coincideEstado =
            filtroEstado === "todas"
                ? true
                : filtroEstado === "activas"
                    ? marca.activo
                    : !marca.activo;

        return coincideNombre && coincideEstado;
    });

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

            <MarcaForm
                idEditando={idEditando}
                nombre={nombre}
                setNombre={setNombre}
                paginaWeb={paginaWeb}
                setPaginaWeb={setPaginaWeb}
                descripcion={descripcion}
                setDescripcion={setDescripcion}
                activo={activo}
                setActivo={setActivo}
                guardar={guardar}
                limpiar={limpiar}
                guardando={guardando}
            />

            <div className="row mt12" style={{ justifyContent: "space-between" }}>
                <h2 className="m0">Listado</h2>
                {cargando && <small style={{ color: "var(--muted)" }}>Cargando...</small>}
            </div>

            <div className="row mt12" style={{ gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 240px" }}>
                    <label className="label">Buscar por nombre</label>
                    <input
                        className="input"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Ej: philips"
                    />
                </div>

                <div style={{ flex: "0 0 220px" }}>
                    <label className="label">Estado</label>
                    <select
                        className="select"
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                        <option value="activas">Activas</option>
                        <option value="todas">Todas</option>
                        <option value="inactivas">Inactivas</option>
                    </select>
                </div>
            </div>

            <MarcasTable
                marcas={marcasFiltradas}
                cargando={cargando}
                editar={editar}
                eliminar={eliminar}
            />
        </div>
    );
}