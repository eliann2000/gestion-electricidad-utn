import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import ProductosPage from "./pages/ProductosPage";
import ClientesPage from "./pages/ClientesPage";
import NuevaVentaPage from "./pages/NuevaVentaPage";
import StockBajoPage from "./pages/StockBajoPage";
import LoginPage from "./pages/LoginPage";
import UsuariosPage from "./pages/UsuariosPage";

import { getToken, getUser, logout } from "./auth";

function RequireAuth({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const usuario = getUser();
  return usuario?.rol === "ADMIN" ? children : <Navigate to="/ventas" replace />;
}

export default function App() {
  const ir = useNavigate();
  const { pathname: ruta } = useLocation();

  const usuario = getUser();
  const claseBtn = (r) => `sidebarBtn ${ruta === r ? "sidebarBtnActive" : ""}`;

  if (ruta === "/login") {
    return <LoginPage onLogin={() => ir("/ventas", { replace: true })} />;
  }

  return (
    <RequireAuth>
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebarHeader">
            <h2>⚡ Sistema</h2>
            <small>Gestión eléctrica</small>

            {usuario && (
              <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 12 }}>
                <div>
                  Sesión: <b>{usuario.username}</b> ({usuario.rol})
                </div>

                <button
                  className="btn btnNeutral btnSm mt12"
                  type="button"
                  onClick={() => (logout(), ir("/login", { replace: true }))}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>

          <nav className="sidebarNav">
            <button className={claseBtn("/productos")} onClick={() => ir("/productos")}>
              📦 Productos
            </button>
            <button className={claseBtn("/clientes")} onClick={() => ir("/clientes")}>
              👥 Clientes
            </button>
            <button className={claseBtn("/ventas")} onClick={() => ir("/ventas")}>
              💰 Nueva Venta
            </button>
            <button className={claseBtn("/stock")} onClick={() => ir("/stock")}>
              📊 Reportes
            </button>

            {usuario?.rol === "ADMIN" && (
              <button className={claseBtn("/usuarios")} onClick={() => ir("/usuarios")}>
                👤 Usuarios
              </button>
            )}
          </nav>
        </aside>

        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/ventas" replace />} />

            <Route path="/productos" element={<ProductosPage user={usuario} />} />
            <Route path="/clientes" element={<ClientesPage user={usuario} />} />
            <Route path="/ventas" element={<NuevaVentaPage user={usuario} />} />
            <Route path="/stock" element={<StockBajoPage user={usuario} />} />

            <Route
              path="/usuarios"
              element={
                <RequireAdmin>
                  <UsuariosPage user={usuario} />
                </RequireAdmin>
              }
            />

            <Route path="*" element={<Navigate to="/ventas" replace />} />
          </Routes>
        </main>
      </div>
    </RequireAuth>
  );
}