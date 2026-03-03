export default function ProductosTable({ productos, cargando, editar, eliminar }) {
    if (!cargando && productos.length === 0) {
        return <p className="mt12">No hay productos que coincidan con el filtro.</p>;
    }

    return (
        <div className="tableWrap mt12">
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Marca</th>
                        <th>Categoría</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Mín</th>
                        <th>Activo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {productos.map((p) => (
                        <tr key={p.id}>
                            <td>{p.id}</td>
                            <td>{p.nombre}</td>
                            <td>{p.marca || "-"}</td>
                            <td>{p.categoria || "-"}</td>
                            <td>${p.precio}</td>
                            <td>{p.stock}</td>
                            <td>{p.stockMinimo}</td>
                            <td>{p.activo ? "Sí" : "No"}</td>
                            <td>
                                <div className="row">
                                    <button className="btn btnNeutral btnSm" type="button" onClick={() => editar(p)}>
                                        Editar
                                    </button>
                                    <button className="btn btnDanger btnSm" type="button" onClick={() => eliminar(p)}>
                                        Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {cargando && (
                        <tr>
                            <td colSpan="9">Cargando...</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}