export function saveSession(token, user) { // La función saveSession guarda el token JWT y los datos del usuario en el almacenamiento local del navegador (localStorage). Esto permite que la sesión del usuario persista incluso después de recargar la página o cerrar el navegador, hasta que el usuario cierre sesión explícitamente.
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
}

export function getToken() { // La función getToken recupera el token JWT almacenado en localStorage. Si no hay un token almacenado, devuelve null. Este token se utiliza para autenticar las solicitudes a las rutas protegidas del backend, enviándolo en el header Authorization de cada solicitud.
    return localStorage.getItem("token");
}

export function getUser() { // La función getUser intenta recuperar los datos del usuario almacenados en localStorage. Si los datos están presentes y son un JSON válido, los parsea y devuelve como un objeto. Si no hay datos o si el JSON no es válido, devuelve null. Esto permite que la aplicación tenga acceso a la información del usuario autenticado, como su nombre de usuario, para mostrarla en la interfaz o para usarla en las solicitudes al backend.
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
}

export function logout() { // La función logout elimina el token y los datos del usuario del almacenamiento local, lo que efectivamente cierra la sesión del usuario. Después de llamar a logout(), el usuario ya no tendrá un token válido para autenticar sus solicitudes, y getUser() devolverá null, lo que hará que la aplicación trate al usuario como no autenticado.
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}