export default function ProductoForm({ idEditando, form, onChange, onSubmit, limpiar, marcas }) {
    const editando = idEditando !== null; //si idEditando es distinto de null, entonces se está editando un producto existente, sino se está creando uno nuevo

    return (
        <div className="mt12 card cardFlat">
            <h2 className="cardTitle">
                {editando ? `Editando producto ID ${idEditando}` : "Nuevo producto"}
            </h2>

            <form onSubmit={onSubmit}>
                <div className="grid2">
                    <div>
                        <label className="label">Código *</label>
                        <input
                            className="input"
                            name="codigo"
                            value={form.codigo}
                            onChange={onChange}
                            placeholder="Ej: LAM-001"
                        />
                    </div>

                    <div>
                        <label className="label">Nombre *</label>
                        <input
                            className="input"
                            name="nombre"
                            value={form.nombre}
                            onChange={onChange}
                            placeholder="Ej: Lámpara LED"
                        />
                    </div>

                    <div>
                        <label className="label">Precio *</label>
                        <input
                            className="input"
                            type="number"
                            min="0"
                            step="0.01"
                            name="precio"
                            value={form.precio}
                            onChange={onChange}
                            placeholder="Ej: 3500"
                            inputMode="decimal"
                        />
                    </div>

                    <div>
                        <label className="label">Marca</label>
                        <select
                            className="select"
                            name="marcaId"
                            value={form.marcaId}
                            onChange={onChange}
                        >
                            <option value="">Sin marca</option>
                            {marcas.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="label">Stock</label>
                        <input
                            className="input"
                            type="number"
                            min="0"
                            step="1"
                            name="stock"
                            value={form.stock}
                            onChange={onChange}
                            placeholder="Ej: 10"
                            inputMode="numeric"
                        />
                    </div>

                    <div>
                        <label className="label">Stock mínimo</label>
                        <input
                            className="input"
                            type="number"
                            min="0"
                            step="1"
                            name="stockMinimo"
                            value={form.stockMinimo}
                            onChange={onChange}
                            placeholder="Ej: 3"
                            inputMode="numeric"
                        />
                    </div>
                </div>

                <div className="row mt12" style={{ justifyContent: "space-between" }}>
                    <label className="checkboxRow">
                        <input type="checkbox" name="activo" checked={form.activo} onChange={onChange} />
                        Activo
                    </label>

                    <div className="row">
                        <button className="btn btnPrimary" type="submit">
                            {editando ? "Guardar cambios" : "Crear"}
                        </button>

                        {editando && (
                            <button className="btn btnNeutral" type="button" onClick={limpiar}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}