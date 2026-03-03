import { useState } from "react";
import { saveSession } from "../auth";

export default function LoginPage({ onLogin }) {
    const [usuario, setUsuario] = useState("");
    const [clave, setClave] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    const entrar = async (e) => {
        e.preventDefault();
        setError("");

        const u = usuario.trim();
        if (!u || !clave) return setError("Completá usuario y contraseña");

        setCargando(true);
        try {
            const res = await fetch("http://localhost:3001/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: u, password: clave }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");

            saveSession(data.token, data.user);
            onLogin?.(data.user);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="card" style={{ maxWidth: 520, margin: "24px auto" }}>
            <h1 className="m0">Ingresar</h1>
            <p className="m0" style={{ color: "var(--muted)", marginTop: 6 }}>
                Iniciá sesión para usar el sistema.
            </p>

            {error && (
                <div className="alert alertError mt12">
                    <b>Error:</b> {error}
                </div>
            )}

            <form onSubmit={entrar} className="mt12">
                <div className="mt12">
                    <label className="label">Usuario</label>
                    <input
                        className="input"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                        placeholder="Ej: admin"
                        autoComplete="username"
                    />
                </div>

                <div className="mt12">
                    <label className="label">Contraseña</label>
                    <input
                        className="input"
                        type="password"
                        value={clave}
                        onChange={(e) => setClave(e.target.value)}
                        placeholder="Tu contraseña"
                        autoComplete="current-password"
                    />
                </div>

                <div className="row mt12" style={{ justifyContent: "flex-end" }}>
                    <button className="btn btnPrimary" type="submit" disabled={cargando}>
                        {cargando ? "Ingresando..." : "Ingresar"}
                    </button>
                </div>
            </form>

            <p className="mt12" style={{ color: "var(--muted)", fontSize: 12 }}>
                * Para pruebas: admin / admin
            </p>
        </div>
    );
}