import { useEffect, useState } from "react";
import { usuariosApi } from "../services/usuarios";

export default function UsuariosPage({ user }) {
    const isAdmin = user?.rol === "ADMIN";

    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        username: "",
        password: "",
        rol: "VENDEDOR",
    });

    function resetForm() {
        setEditingId(null);
        setForm({ username: "", password: "", rol: "VENDEDOR" });
    }

    async function cargarUsuarios() {
        setLoading(true);
        setError("");
        try {
            const data = await usuariosApi.list();
            setUsuarios(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // Si no es admin, no cargamos nada (evita pedir al backend y recibir 403)
        if (!isAdmin) return;
        cargarUsuarios();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin]);

    function onChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        setError("");

        const username = form.username.trim();
        const rol = form.rol === "ADMIN" ? "ADMIN" : "VENDEDOR";
        const password = form.password;

        if (!username) return setError("El username es obligatorio");
        if (editingId === null && !password) return setError("La contraseña es obligatoria");

        try {
            if (editingId === null) {
                await usuariosApi.create({ username, password, rol });
            } else {
                const body = { username, rol };
                if (password) body.password = password;
                await usuariosApi.update(editingId, body);
            }

            resetForm();
            await cargarUsuarios();
        } catch (e2) {
            setError(e2.message);
        }
    }

    function onEditarClick(u) {
        setEditingId(u.id);
        setForm({
            username: u.username ?? "",
            password: "",
            rol: u.rol === "ADMIN" ? "ADMIN" : "VENDEDOR",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function onEliminarClick(u) {
        const ok = window.confirm(`¿Eliminar el usuario "${u.username}" (ID ${u.id})?`);
        if (!ok) return;

        setError("");
        try {
            await usuariosApi.remove(u.id);
            if (editingId === u.id) resetForm();
            await cargarUsuarios();
        } catch (e2) {
            setError(e2.message);
        }
    }

    // ✅ Render si NO es admin
    if (!isAdmin) {
        return (
            <div className="card">
                <h1 className="m0">Usuarios</h1>
                <div className="alert alertError mt12">
                    <b>Error:</b> Solo ADMIN puede administrar usuarios.
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                    <h1 className="m0">Usuarios</h1>
                    <p className="m0" style={{ color: "var(--muted)", marginTop: 6 }}>
                        Total: <b>{usuarios.length}</b>
                    </p>
                </div>
            </div>

            {error && (
                <div className="alert alertError mt12">
                    <b>Error:</b> {error}
                </div>
            )}

            <div className="mt12 card cardFlat">
                <h2 className="cardTitle">
                    {editingId === null ? "Nuevo usuario" : `Editando usuario ID ${editingId}`}
                </h2>

                <form onSubmit={onSubmit}>
                    <div className="grid2">
                        <div>
                            <label className="label">Username *</label>
                            <input
                                className="input"
                                name="username"
                                value={form.username}
                                onChange={onChange}
                                placeholder="Ej: vendedor1"
                            />
                        </div>

                        <div>
                            <label className="label">Contraseña {editingId === null ? "*" : "(opcional)"}</label>
                            <input
                                className="input"
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={onChange}
                                placeholder={editingId === null ? "Ej: vendedor123" : "Dejá vacío si no cambia"}
                            />
                        </div>

                        <div>
                            <label className="label">Rol</label>
                            <select className="select" name="rol" value={form.rol} onChange={onChange}>
                                <option value="VENDEDOR">VENDEDOR</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                        </div>
                    </div>

                    <div className="row mt12" style={{ justifyContent: "flex-end" }}>
                        <div className="row">
                            <button className="btn btnPrimary" type="submit">
                                {editingId === null ? "Crear" : "Guardar cambios"}
                            </button>

                            {editingId !== null && (
                                <button className="btn btnNeutral" type="button" onClick={resetForm}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            <div className="row mt12" style={{ justifyContent: "space-between" }}>
                <h2 className="m0">Listado</h2>
                {loading && <small style={{ color: "var(--muted)" }}>Cargando...</small>}
            </div>

            {!loading && usuarios.length === 0 ? (
                <p className="mt12">No hay usuarios.</p>
            ) : (
                <div className="tableWrap mt12">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.username}</td>
                                    <td>{u.rol}</td>
                                    <td>
                                        <div className="row">
                                            <button className="btn btnNeutral btnSm" type="button" onClick={() => onEditarClick(u)}>
                                                Editar
                                            </button>
                                            <button className="btn btnDanger btnSm" type="button" onClick={() => onEliminarClick(u)}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {loading && (
                                <tr>
                                    <td colSpan="4">Cargando...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}