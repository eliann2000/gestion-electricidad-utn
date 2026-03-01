import { useEffect, useState } from "react";
import { reportesApi } from "../services/reportes";

export default function StockBajoPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function cargar() {
    setLoading(true);
    setError("");
    try {
      const data = await reportesApi.stockBajo();
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="m0">Reporte: Stock bajo</h1>
          <p className="m0" style={{ color: "var(--muted)", marginTop: 6 }}>
            Productos con <b>stock ≤ stock mínimo</b>.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alertError mt12">
          <b>Error:</b> {error}
        </div>
      )}

      {loading ? (
        <p className="mt12" style={{ color: "var(--muted)" }}>
          Cargando...
        </p>
      ) : items.length === 0 ? (
        <div className="alert alertOk mt12">
          <b>OK:</b> No hay productos con stock bajo 🎉
        </div>
      ) : (
        <>
          <div className="row mt12" style={{ justifyContent: "space-between" }}>
            <p className="m0" style={{ color: "var(--muted)" }}>
              Resultados: <b>{items.length}</b>
            </p>
          </div>

          <div className="tableWrap mt12">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Marca</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                  <th>Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nombre}</td>
                    <td>{p.marca ?? "-"}</td>
                    <td>{p.categoria ?? "-"}</td>
                    <td>{p.stock}</td>
                    <td>{p.stockMinimo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}