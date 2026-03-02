export default function ClientesTable({ clientes, loading, onEditarClick, onEliminarClick }) {
    if (!loading && clientes.length === 0) {
        return <p className="mt12">No hay clientes que coincidan con la búsqueda.</p>;
    }

    return (
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
                    {clientes.map((c) => (
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
                                    <button
                                        className="btn btnNeutral btnSm"
                                        type="button"
                                        onClick={() => onEditarClick(c)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="btn btnDanger btnSm"
                                        type="button"
                                        onClick={() => onEliminarClick(c)}
                                    >
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
    );
}