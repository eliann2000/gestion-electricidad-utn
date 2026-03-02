export default function ClientesListadoHeader({ loading, filtro, setFiltro }) {
    return (
        <>
            <div className="row mt12" style={{ justifyContent: "space-between" }}>
                <h2 className="m0">Listado</h2>
                {loading && <small style={{ color: "var(--muted)" }}>Cargando...</small>}
            </div>

            <div className="row mt12" style={{ gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 280px" }}>
                    <label className="label">Buscar por nombre o apellido</label>
                    <input
                        className="input"
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        placeholder="Ej: juan o pérez"
                    />
                </div>
            </div>
        </>
    );
}