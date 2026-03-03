export default function ClientesHeader({ total }) {
    return (
        <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
                <h1 className="m0">Clientes</h1>
                <p className="m0" style={{ color: "var(--muted)", marginTop: 6 }}>
                    Total: <b>{total}</b>
                </p>
            </div>
        </div>
    );
}