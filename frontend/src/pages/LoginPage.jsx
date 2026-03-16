import { useState } from "react";
import { saveSession } from "../auth";

export default function LoginPage({ onLogin }) {
    const [usuario, setUsuario] = useState("");
    const [clave, setClave] = useState("");
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");

    const entrar = async (e) => { // e es el evento de submit del formulario. La función entrar se encarga de manejar el proceso de inicio de sesión, que incluye validar los datos ingresados, enviar la solicitud al backend, manejar la respuesta y guardar la sesión si el login es exitoso.
        e.preventDefault();
        setError("");

        const u = usuario.trim(); //trim elimina los espacios al principio y al final del string. Esto es para evitar que el usuario ingrese un nombre de usuario con espacios innecesarios, lo que podría causar problemas al momento de hacer login.
        if (!u || !clave) return setError("Completá usuario y contraseña");

        setCargando(true);
        try {
            const res = await fetch("http://localhost:3001/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: u, password: clave }),
            });

            const data = await res.json().catch(() => ({})); //intenta parsear la respuesta como JSON. Si la respuesta no es un JSON válido, se captura el error y se devuelve un objeto vacío en su lugar. Esto evita que la aplicación se rompa si el backend devuelve una respuesta inesperada o sin formato JSON, y permite manejar el error de manera más controlada.
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
                        placeholder="Tu usuario"
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

        </div>
    );
}