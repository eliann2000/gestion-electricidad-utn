import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import ProductosPage from "./pages/ProductosPage";
import ClientesPage from "./pages/ClientesPage";
import NuevaVentaPage from "./pages/NuevaVentaPage";
import StockBajoPage from "./pages/StockBajoPage";
import LoginPage from "./pages/LoginPage";
import MarcasPage from "./pages/MarcasPage";

import { getToken, getUser, logout } from "./auth";

function RequireAuth({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const ir = useNavigate();
  const { pathname: ruta } = useLocation();

  const usuario = getUser();
  const claseBtn = (r) => `sidebarBtn ${ruta === r ? "sidebarBtnActive" : ""}`;

  if (ruta === "/login") { //Si la ruta es /login, muestra la página de login. Si el usuario ya tiene un token válido, el componente LoginPage se encargará de redirigirlo a /productos después de iniciar sesión correctamente. Si no, muestra el formulario de login para que pueda ingresar sus credenciales.
    return <LoginPage onLogin={() => ir("/productos", { replace: true })} />; //El prop onLogin es una función que se pasa al componente LoginPage para que este pueda llamar a ir("/productos", { replace: true }) después de un login exitoso, lo que redirige al usuario a la página de productos. El replace: true es para que la navegación reemplace la entrada actual en el historial del navegador, evitando que el usuario pueda volver a la página de login con el botón de atrás después de iniciar sesión.
  }

  return (
    <RequireAuth>
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebarHeader">
            <h2>⚡ Sistema</h2>
            <small>Gestión eléctrica</small>

            {usuario && ( //Si el usuario está autenticado (es decir, si getUser() devuelve un objeto de usuario válido), muestra su nombre de usuario y un botón para cerrar sesión. Al hacer clic en el botón de cerrar sesión, se llama a la función logout() para eliminar la sesión del usuario y luego se redirige a la página de login usando ir("/login", { replace: true }).
              <div style={{ marginTop: 10, color: "var(--muted)", fontSize: 12 }}>
                <div>
                  Sesión: <b>{usuario.username}</b>
                </div>

                <button
                  className="btn btnNeutral btnSm mt12"
                  type="button"
                  onClick={() => {
                    logout();
                    ir("/login", { replace: true });
                  }}
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
            <button className={claseBtn("/marcas")} onClick={() => ir("/marcas")}>
              🏷️ Marcas
            </button>
            <button className={claseBtn("/ventas")} onClick={() => ir("/ventas")}>
              💰 Nueva Venta
            </button>
            <button className={claseBtn("/stock")} onClick={() => ir("/stock")}>
              📊 Reportes
            </button>
          </nav>
        </aside>

        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/productos" replace />} />
            <Route path="/productos" element={<ProductosPage user={usuario} />} />
            <Route path="/clientes" element={<ClientesPage user={usuario} />} />
            <Route path="/marcas" element={<MarcasPage user={usuario} />} />
            <Route path="/ventas" element={<NuevaVentaPage user={usuario} />} />
            <Route path="/stock" element={<StockBajoPage user={usuario} />} />
            <Route path="*" element={<Navigate to="/ventas" replace />} />
          </Routes>
        </main>
      </div>
    </RequireAuth>
  );
}