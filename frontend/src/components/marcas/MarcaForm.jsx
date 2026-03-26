export default function MarcaForm({
    idEditando,
    nombre,
    setNombre,
    paginaWeb,
    setPaginaWeb,
    descripcion,
    setDescripcion,
    activo,
    setActivo,
    guardar,
    limpiar,
    guardando,
}) {
    return (
        <div className="mt12 card cardFlat">
            <h2 className="cardTitle">
                {idEditando ? `Editando marca ID ${idEditando}` : "Nueva marca"}
            </h2>

            <form onSubmit={guardar}>
                <div className="grid2">
                    <div>
                        <label className="label">Nombre *</label>
                        <input
                            className="input"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Philips"
                        />
                    </div>

                    <div>
                        <label className="label">Página web</label>
                        <input
                            className="input"
                            value={paginaWeb}
                            onChange={(e) => setPaginaWeb(e.target.value)}
                            placeholder="Ej: https://www.marca.com"
                        />
                    </div>

                    <div style={{ gridColumn: "1 / -1" }}>
                        <label className="label">Descripción</label>
                        <input
                            className="input"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Ej: Marca de productos eléctricos"
                        />
                    </div>
                </div>

                <div className="row mt12" style={{ justifyContent: "space-between" }}>
                    <label className="checkboxRow">
                        <input
                            type="checkbox"
                            checked={activo}
                            onChange={(e) => setActivo(e.target.checked)}
                        />
                        Activa
                    </label>

                    <div className="row">
                        <button className="btn btnPrimary" type="submit" disabled={guardando}>
                            {guardando ? "Guardando..." : idEditando ? "Guardar cambios" : "Crear"}
                        </button>

                        {idEditando && (
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