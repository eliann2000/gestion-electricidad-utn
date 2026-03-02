export default function ClienteForm({ editingId, form, onChange, onSubmit, resetForm }) {
    return (
        <div className="mt12 card cardFlat">
            <h2 className="cardTitle">
                {editingId === null ? "Nuevo cliente" : `Editando cliente ID ${editingId}`}
            </h2>

            <form onSubmit={onSubmit}>
                <div className="grid2">
                    <div>
                        <label className="label">Nombre *</label>
                        <input
                            className="input"
                            name="nombre"
                            placeholder="Ej: Juan"
                            value={form.nombre}
                            onChange={onChange}
                        />
                    </div>

                    <div>
                        <label className="label">Apellido *</label>
                        <input
                            className="input"
                            name="apellido"
                            placeholder="Ej: Pérez"
                            value={form.apellido}
                            onChange={onChange}
                        />
                    </div>

                    <div>
                        <label className="label">Teléfono *</label>
                        <input
                            className="input"
                            type="tel"
                            name="telefono"
                            placeholder="Ej: 3515551234"
                            value={form.telefono}
                            onChange={onChange}
                            inputMode="numeric"
                        />
                    </div>

                    <div>
                        <label className="label">Email *</label>
                        <input
                            className="input"
                            type="email"
                            name="email"
                            placeholder="Ej: juan@gmail.com"
                            value={form.email}
                            onChange={onChange}
                        />
                    </div>

                    <div>
                        <label className="label">Dirección</label>
                        <input
                            className="input"
                            name="direccion"
                            placeholder="Ej: Córdoba"
                            value={form.direccion}
                            onChange={onChange}
                        />
                    </div>
                </div>

                <div className="row mt12" style={{ justifyContent: "flex-end" }}>
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