import { useState } from "react";

import ProductosPage from "./pages/ProductosPage";
import ClientesPage from "./pages/ClientesPage";
import NuevaVentaPage from "./pages/NuevaVentaPage";
import StockBajoPage from "./pages/StockBajoPage";

export default function App() {
  const [page, setPage] = useState("ventas");

  const navBtnClass = (key) =>
    `btn ${page === key ? "btnActive" : ""}`;

  return (
    <div className="app">
      <header className="header">
        <div className="headerInner">
          <div className="brand">
            <h2>Gestión Electricidad (MVP)</h2>
            <small>Stock • Ventas • Reportes</small>
          </div>

          <nav className="nav">
            <button className={navBtnClass("productos")} onClick={() => setPage("productos")}>
              Productos
            </button>
            <button className={navBtnClass("clientes")} onClick={() => setPage("clientes")}>
              Clientes
            </button>
            <button className={navBtnClass("ventas")} onClick={() => setPage("ventas")}>
              Nueva Venta
            </button>
            <button className={navBtnClass("stock")} onClick={() => setPage("stock")}>
              Stock Bajo
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        {page === "productos" && <ProductosPage />}
        {page === "clientes" && <ClientesPage />}
        {page === "ventas" && <NuevaVentaPage />}
        {page === "stock" && <StockBajoPage />}
      </main>
    </div>
  );
}