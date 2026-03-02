export default function ProductoForm({ editingId, form, onChange, onSubmit, resetForm }) {
    return (
        <div className="mt12 card cardFlat">
            <h2 className="cardTitle">
                {editingId === null ? "Nuevo producto" : `Editando producto ID ${editingId}`}
            </h2>

            <form onSubmit={onSubmit}>
                <div className="grid2">
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
                        <input
                            className="input"
                            name="marca"
                            value={form.marca}
                            onChange={onChange}
                            placeholder="Ej: Ferrolux"
                        />
                    </div>

                    <div>
                        <label className="label">Categoría</label>
                        <input
                            className="input"
                            name="categoria"
                            value={form.categoria}
                            onChange={onChange}
                            placeholder="Ej: Iluminación"
                        />
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
                            {editingId === null ? "Crear" : "Guardar cambios"}
                        </button>

                        {editingId !== null && (
                            <button className="btn btnNeutral" type="button" onClick={resetForm}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}