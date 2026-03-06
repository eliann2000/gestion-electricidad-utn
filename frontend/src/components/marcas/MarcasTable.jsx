export default function MarcasTable({ marcas, cargando, editar, eliminar }) {
    if (!cargando && marcas.length === 0) {
        return <p className="mt12">No hay marcas que coincidan con la búsqueda.</p>;
    }

    return (
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
                    {marcas.map((marca) => (
                        <tr key={marca.id}>
                            <td>{marca.id}</td>
                            <td>{marca.nombre}</td>
                            <td>{marca.descripcion || "-"}</td>
                            <td>{marca.paginaWeb || "-"}</td>
                            <td>{marca.activo ? "Sí" : "No"}</td>
                            <td>
                                <div className="row">
                                    <button
                                        className="btn btnPrimary btnSm"
                                        type="button"
                                        onClick={() => editar(marca)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="btn btnDanger btnSm"
                                        type="button"
                                        onClick={() => eliminar(marca.id)}
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
    );
}