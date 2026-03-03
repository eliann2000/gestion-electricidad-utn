import { useMemo } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import ProductosPage from "./pages/ProductosPage";
import ClientesPage from "./pages/ClientesPage";
import NuevaVentaPage from "./pages/NuevaVentaPage";
import StockBajoPage from "./pages/StockBajoPage";
import LoginPage from "./pages/LoginPage";
import UsuariosPage from "./pages/UsuariosPage";

import { getToken, getUser, logout } from "./auth";

function RequireAuth({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }) {
  const user = getUser();
  if (!user || user.rol !== "ADMIN") return <Navigate to="/ventas" replace />;
  return children;
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = getToken();
  const user = useMemo(() => getUser(), [token]);

  const path = location.pathname;

  const navBtnClass = (route) => `sidebarBtn ${path === route ? "sidebarBtnActive" : ""}`;

  function go(route) {
    navigate(route);
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  // ✅ Login sin sidebar
  if (path === "/login") {
    return <LoginPage onLogin={() => navigate("/ventas", { replace: true })} />;
  }

  return (
    <RequireAuth>
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
            <button className={navBtnClass("/productos")} onClick={() => go("/productos")}>
              📦 Productos
            </button>
            <button className={navBtnClass("/clientes")} onClick={() => go("/clientes")}>
              👥 Clientes
            </button>
            <button className={navBtnClass("/ventas")} onClick={() => go("/ventas")}>
              💰 Nueva Venta
            </button>
            <button className={navBtnClass("/stock")} onClick={() => go("/stock")}>
              📊 Reportes
            </button>

            {user?.rol === "ADMIN" && (
              <button className={navBtnClass("/usuarios")} onClick={() => go("/usuarios")}>
                👤 Usuarios
              </button>
            )}
          </nav>
        </aside>

        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/ventas" replace />} />

            <Route path="/productos" element={<ProductosPage user={user} />} />
            <Route path="/clientes" element={<ClientesPage user={user} />} />
            <Route path="/ventas" element={<NuevaVentaPage user={user} />} />
            <Route path="/stock" element={<StockBajoPage user={user} />} />

            <Route
              path="/usuarios"
              element={
                <RequireAdmin>
                  <UsuariosPage user={user} />
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