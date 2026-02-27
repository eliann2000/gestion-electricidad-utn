import { useState } from "react";

import ProductosPage from "./pages/ProductosPage";
import ClientesPage from "./pages/ClientesPage";
import NuevaVentaPage from "./pages/NuevaVentaPage";

export default function App() {
  const [page, setPage] = useState("ventas");

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <header style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
        <h2 style={{ margin: 0 }}>Gestión Electricidad (MVP)</h2>

        <nav style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" onClick={() => setPage("productos")}>
            Productos
          </button>
          <button type="button" onClick={() => setPage("clientes")}>
            Clientes
          </button>
          <button type="button" onClick={() => setPage("ventas")}>
            Nueva Venta
          </button>
        </nav>
      </header>

      <main>
        {page === "productos" && <ProductosPage />}
        {page === "clientes" && <ClientesPage />}
        {page === "ventas" && <NuevaVentaPage />}
      </main>
    </div>
  );
}