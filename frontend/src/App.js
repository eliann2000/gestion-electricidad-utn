import { useState } from "react";

import ProductosPage from "./pages/ProductosPage";
import ClientesPage from "./pages/ClientesPage";
import NuevaVentaPage from "./pages/NuevaVentaPage";
import StockBajoPage from "./pages/StockBajoPage";

export default function App() {
  const [page, setPage] = useState("ventas");

  const navBtnClass = (key) =>
    `sidebarBtn ${page === key ? "sidebarBtnActive" : ""}`;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebarHeader">
          <h2>⚡ Sistema</h2>
          <small>Gestión eléctrica</small>
        </div>

        <nav className="sidebarNav">
          <button className={navBtnClass("productos")} onClick={() => setPage("productos")}>
            📦 Productos
          </button>
          <button className={navBtnClass("clientes")} onClick={() => setPage("clientes")}>
            👥 Clientes
          </button>
          <button className={navBtnClass("ventas")} onClick={() => setPage("ventas")}>
            💰 Nueva Venta
          </button>
          <button className={navBtnClass("stock")} onClick={() => setPage("stock")}>
            📊 Reportes
          </button>
        </nav>
      </aside>

      <main className="content">
        {page === "productos" && <ProductosPage />}
        {page === "clientes" && <ClientesPage />}
        {page === "ventas" && <NuevaVentaPage />}
        {page === "stock" && <StockBajoPage />}
      </main>
    </div>
  );
}