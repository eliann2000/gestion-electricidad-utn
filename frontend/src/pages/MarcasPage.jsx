import { useEffect, useState } from "react";
import { marcasApi } from "../services/marcas";
import MarcaForm from "../components/marcas/MarcaForm";
import MarcasTable from "../components/marcas/MarcasTable";

export default function MarcasPage() {
    const [marcas, setMarcas] = useState([]); // El estado marcas se utiliza para almacenar la lista de marcas que se obtiene del backend. Inicialmente es un array vacío, y se actualiza con los datos traídos mediante la función cargarMarcas.

    // Lo que el usuario escribe en el formulario

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [paginaWeb, setPaginaWeb] = useState("");
    const [activo, setActivo] = useState(true);

    // Estados para controlar la interfaz

    const [idEditando, setIdEditando] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false); // El estado guardando se utiliza para indicar si se está realizando una operación de guardado (creación o actualización) de una marca. Mientras guardando es true, se pueden deshabilitar los botones del formulario para evitar que el usuario realice múltiples envíos mientras la operación está en curso. Se establece en true al iniciar la operación de guardado y se vuelve a false al finalizar, ya sea con éxito o con error.
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
        const ok = window.confirm("¿Seguro que querés eliminar esta marca?");
        if (!ok) return;

        try {
            setError("");
            await marcasApi.eliminar(id);

            if (idEditando === id) { // Si la marca que se acaba de eliminar es la misma que se está editando actualmente (es decir, si el usuario estaba editando una marca y luego decidió eliminarla), entonces se llama a la función limpiar() para restablecer el formulario a su estado inicial. Esto evita que el formulario muestre datos de una marca que ya no existe después de eliminarla.
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
            filtroEstado === "todas" // Si el filtro de estado es "todas", entonces coincideEstado es true para todas las marcas, sin importar su estado activo. Si el filtro es "activas", entonces coincideEstado es true solo para las marcas que tienen activo === true. Si el filtro es "inactivas", entonces coincideEstado es true solo para las marcas que tienen activo === false.
                ? true // Si el filtro de estado es "todas", entonces coincideEstado es true para todas las marcas, sin importar su estado activo. Si el filtro es "activas", entonces coincideEstado es true solo para las marcas que tienen activo === true. Si el filtro es "inactivas", entonces coincideEstado es true solo para las marcas que tienen activo === false.
                : filtroEstado === "activas" // Si el filtro de estado es "activas", entonces coincideEstado es true solo para las marcas que tienen activo === true. Si el filtro es "inactivas", entonces coincideEstado es true solo para las marcas que tienen activo === false.
                    ? marca.activo // Si el filtro de estado es "activas", entonces coincideEstado es true solo para las marcas que tienen activo === true. Si el filtro es "inactivas", entonces coincideEstado es true solo para las marcas que tienen activo === false.
                    : !marca.activo; // Si el filtro de estado es "inactivas", entonces coincideEstado es true solo para las marcas que tienen activo === false.

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