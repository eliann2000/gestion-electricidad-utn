import { useEffect, useState } from "react";
import { usuariosApi } from "../services/usuarios";

const formVacio = { username: "", password: "", rol: "VENDEDOR" };

export default function UsuariosPage({ user }) {
    const admin = user?.rol === "ADMIN";

    const [lista, setLista] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const [idEdit, setIdEdit] = useState(null);
    const [form, setForm] = useState(formVacio);

    const limpiar = () => (setIdEdit(null), setForm(formVacio));

    const cargar = async () => {
        setCargando(true);
        setError("");
        try {
            setLista(await usuariosApi.list());
        } catch (e) {
            setError(e.message);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (admin) cargar();
    }, [admin]);

    const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const guardar = async (e) => {
        e.preventDefault();
        setError("");

        const username = form.username.trim();
        const rol = form.rol === "ADMIN" ? "ADMIN" : "VENDEDOR";
        const password = form.password;

        if (!username) return setError("El username es obligatorio");
        if (!idEdit && !password) return setError("La contraseña es obligatoria");

        try {
            if (!idEdit) await usuariosApi.create({ username, password, rol });
            else await usuariosApi.update(idEdit, { username, rol, ...(password ? { password } : {}) });

            limpiar();
            cargar();
        } catch (e) {
            setError(e.message);
        }
    };

    const editar = (u) => {
        setIdEdit(u.id);
        setForm({ username: u.username || "", password: "", rol: u.rol === "ADMIN" ? "ADMIN" : "VENDEDOR" });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const eliminar = async (u) => {
        if (!window.confirm(`¿Eliminar el usuario "${u.username}" (ID ${u.id})?`)) return;
        setError("");
        try {
            await usuariosApi.remove(u.id);
            if (idEdit === u.id) limpiar();
            cargar();
        } catch (e) {
            setError(e.message);
        }
    };

    if (!admin) {
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
            <h1 className="m0">Usuarios</h1>
            <p className="m0" style={{ color: "var(--muted)", marginTop: 6 }}>
                Total: <b>{lista.length}</b>
            </p>

            {error && (
                <div className="alert alertError mt12">
                    <b>Error:</b> {error}
                </div>
            )}

            <div className="mt12 card cardFlat">
                <h2 className="cardTitle">{idEdit ? `Editando usuario ID ${idEdit}` : "Nuevo usuario"}</h2>

                <form onSubmit={guardar}>
                    <div className="grid2">
                        <div>
                            <label className="label">Username *</label>
                            <input className="input" name="username" value={form.username} onChange={onChange} placeholder="Ej: vendedor1" />
                        </div>

                        <div>
                            <label className="label">Contraseña {idEdit ? "(opcional)" : "*"}</label>
                            <input
                                className="input"
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={onChange}
                                placeholder={idEdit ? "Dejá vacío si no cambia" : "Ej: vendedor123"}
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
                                {idEdit ? "Guardar" : "Crear"}
                            </button>
                            {idEdit && (
                                <button className="btn btnNeutral" type="button" onClick={limpiar}>
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            <div className="row mt12" style={{ justifyContent: "space-between" }}>
                <h2 className="m0">Listado</h2>
                {cargando && <small style={{ color: "var(--muted)" }}>Cargando...</small>}
            </div>

            {!cargando && lista.length === 0 ? (
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
                            {lista.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.username}</td>
                                    <td>{u.rol}</td>
                                    <td>
                                        <div className="row">
                                            <button className="btn btnNeutral btnSm" type="button" onClick={() => editar(u)}>
                                                Editar
                                            </button>
                                            <button className="btn btnDanger btnSm" type="button" onClick={() => eliminar(u)}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {cargando && (
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