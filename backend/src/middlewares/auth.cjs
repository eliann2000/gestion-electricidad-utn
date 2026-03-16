const jwt = require("jsonwebtoken");

// Verifica token y guarda req.user

//Revisa si la request trae un token válido.
//Si el token es correcto, deja pasar la request.
//Si no, la corta con error.

function authRequired(req, res, next) {
    const h = req.headers.authorization || ""; //lee el header Authorization de la request, que debería tener el formato "Bearer
    const token = h.startsWith("Bearer ") ? h.slice(7) : null; //si el header empieza con "Bearer ", extrae el token que viene después de ese prefijo. Si no, token es null.

    if (!token) {
        return res.status(401).json({ message: "No autenticado" });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET); //verifica el token usando la clave secreta definida en las variables de entorno. Si el token es válido, devuelve los datos del usuario que se guardan en req.user para que estén disponibles en las rutas protegidas. Si el token no es válido, lanza un error que se captura en el catch.
        next();
    } catch {
        return res.status(401).json({ message: "Token inválido" });
    }
}

module.exports = { authRequired };