import { useState } from "react";
import { saveSession } from "../auth";

export default function LoginPage({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        const u = username.trim();
        const p = password;

        if (!u || !p) return setError("Completá usuario y contraseña");

        setLoading(true);
        try {
            const res = await fetch("http://localhost:3001/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: u, password: p }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || "Error al iniciar sesión");

            saveSession(data.token, data.user);

            // Avisamos a App.js (para redirigir o refrescar UI)
            if (onLogin) onLogin(data.user);
        } catch (e2) {
            setError(e2.message);
        } finally {
            setLoading(false);
        }
    }

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

            <form onSubmit={handleSubmit} className="mt12">
                <div className="mt12">
                    <label className="label">Usuario</label>
                    <input
                        className="input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Ej: admin"
                        autoComplete="username"
                    />
                </div>

                <div className="mt12">
                    <label className="label">Contraseña</label>
                    <input
                        className="input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Tu contraseña"
                        autoComplete="current-password"
                    />
                </div>

                <div className="row mt12" style={{ justifyContent: "flex-end" }}>
                    <button className="btn btnPrimary" type="submit" disabled={loading}>
                        {loading ? "Ingresando..." : "Ingresar"}
                    </button>
                </div>
            </form>

            <p className="mt12" style={{ color: "var(--muted)", fontSize: 12 }}>
                * Para pruebas: admin / admin (o la contraseña que pusiste).
            </p>
        </div>
    );
}