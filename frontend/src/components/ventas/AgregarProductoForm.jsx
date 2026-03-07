export default function AgregarProductoForm({
    productos,
    productoId,
    setProductoId,
    cantidad,
    setCantidad,
    agregarItem,
}) {
    return (
        <div className="mt12 card cardFlat">
            <h2 className="cardTitle">Agregar productos</h2>

            <div className="grid2">
                <div>
                    <label className="label">Producto</label>
                    <select
                        className="select"
                        value={productoId}
                        onChange={(e) => setProductoId(e.target.value)}
                    >
                        <option value="">Elegí producto</option>
                        {productos.map((producto) => (
                            <option key={producto.id} value={producto.id}>
                                {producto.id} - {producto.nombre} (stock {producto.stock}) - ${producto.precio}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="label">Cantidad</label>
                    <input
                        className="input"
                        type="number"
                        min="1"
                        step="1"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                        placeholder="Ej: 1"
                    />
                </div>
            </div>

            <div className="row mt12" style={{ justifyContent: "flex-end" }}>
                <button className="btn btnPrimary" type="button" onClick={agregarItem}>
                    Agregar al carrito
                </button>
            </div>
        </div>
    );
}