import { useState } from "react";

import ProductosPage from "./pages/ProductosPage";
import ClientesPage from "./pages/ClientesPage";
import NuevaVentaPage from "./pages/NuevaVentaPage";
import StockBajoPage from "./pages/StockBajoPage";
import LoginPage from "./pages/LoginPage";
import UsuariosPage from "./pages/UsuariosPage";

import { getToken, getUser, logout } from "./auth";

export default function App() {
  const [page, setPage] = useState("ventas");

  // ✅ Sesión
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());

  const navBtnClass = (key) => `sidebarBtn ${page === key ? "sidebarBtnActive" : ""}`;

  function handleLogin(u) {
    // LoginPage ya guardó token+user en localStorage, acá solo refrescamos estado
    setToken(getToken());
    setUser(u);
    setPage("ventas");
  }

  function handleLogout() {
    logout();
    setToken(null);
    setUser(null);
    setPage("ventas");
  }

  // ✅ Si no hay token, mostrar login
  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebarHeader">
          <h2>⚡ Sistema</h2>
          <small>Gestión eléctrica</small>

          <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 12 }}>
            {user ? (
              <>
                <div>
                  Sesión: <b>{user.username}</b> ({user.rol})
                </div>
                <button
                  className="btn btnNeutral btnSm mt12"
                  type="button"
                  onClick={handleLogout}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Cerrar sesión
                </button>
              </>
            ) : null}
          </div>
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
          {user?.rol === "ADMIN" && (
            <button className={navBtnClass("usuarios")} onClick={() => setPage("usuarios")}>
              👤 Usuarios
            </button>
          )}
        </nav>
      </aside>

      <main className="content">
        {page === "productos" && <ProductosPage user={user} />}
        {page === "clientes" && <ClientesPage user={user} />}
        {page === "ventas" && <NuevaVentaPage user={user} />}
        {page === "stock" && <StockBajoPage user={user} />}
        {page === "usuarios" && <UsuariosPage user={user} />}
      </main>
    </div>
  );
}