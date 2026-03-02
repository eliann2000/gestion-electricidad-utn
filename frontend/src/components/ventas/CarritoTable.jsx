export default function CarritoTable({
    items,
    productos,
    editRowPid,
    editProductoId,
    editCantidad,
    setEditProductoId,
    setEditCantidad,
    iniciarEdicion,
    guardarEdicion,
    cancelarEdicion,
    quitarItem,
}) {
    return (
        <div className="mt12">
            <div className="row" style={{ justifyContent: "space-between" }}>
                <h2 className="m0">Carrito</h2>
                <p className="m0" style={{ color: "var(--muted)" }}>
                    Items: <b>{items.length}</b>
                </p>
            </div>

            {items.length === 0 ? (
                <p className="mt12">No hay items.</p>
            ) : (
                <div className="tableWrap mt12">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Precio</th>
                                <th>Cantidad</th>
                                <th>Subtotal</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((it) => (
                                <tr key={it.productoId}>
                                    <td>
                                        {it.productoId} - {it.nombre}
                                    </td>
                                    <td>${it.precio}</td>

                                    <td>
                                        {editRowPid === it.productoId ? (
                                            <input
                                                className="input"
                                                style={{ width: 110 }}
                                                inputMode="numeric"
                                                value={editCantidad}
                                                onChange={(e) => setEditCantidad(e.target.value)}
                                            />
                                        ) : (
                                            it.cantidad
                                        )}
                                    </td>

                                    <td>${it.subtotal}</td>

                                    <td>
                                        {editRowPid === it.productoId ? (
                                            <div className="row" style={{ alignItems: "center" }}>
                                                <select
                                                    className="select"
                                                    style={{ width: "min(260px, 60vw)" }}
                                                    value={editProductoId}
                                                    onChange={(e) => setEditProductoId(e.target.value)}
                                                >
                                                    {productos.map((p) => (
                                                        <option key={p.id} value={p.id}>
                                                            {p.id} - {p.nombre} (stock {p.stock}) - ${p.precio}
                                                        </option>
                                                    ))}
                                                </select>

                                                <div className="rowNoWrap">
                                                    <button className="btn btnPrimary btnSm" type="button" onClick={guardarEdicion}>
                                                        Guardar
                                                    </button>
                                                    <button className="btn btnNeutral btnSm" type="button" onClick={cancelarEdicion}>
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="row">
                                                <button className="btn btnWarning btnSm" type="button" onClick={() => iniciarEdicion(it)}>
                                                    Modificar
                                                </button>
                                                <button
                                                    className="btn btnDanger btnSm"
                                                    type="button"
                                                    onClick={() => quitarItem(it.productoId)}
                                                >
                                                    Quitar
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}