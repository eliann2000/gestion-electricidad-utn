export default function ClientesTable({ clientes, cargando, editar, eliminar }) {
    if (!cargando && clientes.length === 0) {
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
                        <th>Localidad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {clientes.map((cli) => (
                        <tr key={cli.id}>
                            <td>{cli.id}</td>
                            <td>
                                {cli.nombre} {cli.apellido}
                            </td>
                            <td>{cli.telefono}</td>
                            <td>{cli.email}</td>
                            <td>{cli.direccion || "-"}</td>
                            <td>{cli.localidad || "-"}</td>
                            <td>
                                <div className="row">
                                    <button className="btn btnNeutral btnSm" type="button" onClick={() => editar(cli)}>
                                        Editar
                                    </button>
                                    <button className="btn btnDanger btnSm" type="button" onClick={() => eliminar(cli)}>
                                        Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {cargando && (
                        <tr>
                            <td colSpan="7">Cargando...</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}