import { useEffect, useState } from "react";
import { reportesApi } from "../services/reportes";

export default function StockBajoPage() {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = async () => {
    setCargando(true);
    setError("");
    try {
      setLista(await reportesApi.stockBajo());
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="m0">Reporte: Stock bajo</h1>
          <p className="m0" style={{ color: "var(--muted)", marginTop: 6 }}>
            Productos con <b>stock mínimo</b>.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alertError mt12">
          <b>Error:</b> {error}
        </div>
      )}

      {cargando && (
        <p className="mt12" style={{ color: "var(--muted)" }}>
          Cargando...
        </p>
      )}

      {!cargando && !error && lista.length === 0 && (
        <div className="alert alertOk mt12">
          No hay productos con stock mínimo.
        </div>
      )}

      {!cargando && lista.length > 0 && (
        <>
          <p className="m0 mt12" style={{ color: "var(--muted)" }}>
            Resultados: <b>{lista.length}</b>
          </p>

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
                {lista.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nombre}</td>
                    <td>{p.marca || "-"}</td>
                    <td>{p.categoria || "-"}</td>
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