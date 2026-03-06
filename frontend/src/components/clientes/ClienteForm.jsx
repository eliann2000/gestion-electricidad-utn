function Campo({ label, ...props }) {
    return (
        <div>
            <label className="label">{label}</label>
            <input className="input" {...props} />
        </div>
    );
}

export default function ClienteForm({ idEditando, form, cambiar, guardar, limpiar }) {
    const editando = idEditando !== null;
    const titulo = editando ? `Editando cliente ID ${idEditando}` : "Nuevo cliente";
    const textoBtn = editando ? "Guardar cambios" : "Crear";

    return (
        <div className="mt12 card cardFlat">
            <h2 className="cardTitle">{titulo}</h2>

            <form onSubmit={guardar}>
                <div className="grid2">
                    <Campo label="Nombre *" name="nombre" placeholder="Ej: Juan" value={form.nombre} onChange={cambiar} />
                    <Campo label="Apellido *" name="apellido" placeholder="Ej: Pérez" value={form.apellido} onChange={cambiar} />

                    <Campo
                        label="Teléfono *"
                        type="tel"
                        name="telefono"
                        placeholder="Ej: 3515551234"
                        value={form.telefono}
                        onChange={cambiar}
                        inputMode="numeric"
                    />

                    <Campo
                        label="Email *"
                        type="email"
                        name="email"
                        placeholder="Ej: juan@gmail.com"
                        value={form.email}
                        onChange={cambiar}
                    />

                    <Campo label="Dirección" name="direccion" placeholder="Ej: Córdoba 123" value={form.direccion} onChange={cambiar} />

                    <Campo label="Localidad" name="localidad" placeholder="Ej: San Francisco" value={form.localidad} onChange={cambiar} />
                </div>

                <div className="row mt12" style={{ justifyContent: "flex-end" }}>
                    <div className="row">
                        <button className="btn btnPrimary" type="submit">
                            {textoBtn}
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