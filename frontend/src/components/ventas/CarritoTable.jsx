export default function CarritoTable({ items, quitar }) {
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
                                    <td>{it.cantidad}</td>
                                    <td>${it.subtotal}</td>
                                    <td>
                                        <div className="row">
                                            <button
                                                className="btn btnDanger btnSm"
                                                type="button"
                                                onClick={() => quitar(it.productoId)}
                                            >
                                                Quitar
                                            </button>
                                        </div>
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