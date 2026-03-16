const express = require("express");
const cors = require("cors"); // middleware para permitir solicitudes desde el frontend (que corre en otro puerto). CORS es un mecanismo de seguridad que restringe las solicitudes HTTP a recursos que están en un dominio diferente al del sitio web que hace la solicitud. En este caso, el backend corre en http://localhost:3001 y el frontend en http://localhost:3000, por lo que se necesita configurar CORS para permitir que el frontend acceda a la API del backend.
require("dotenv").config(); //carga las variables de entorno desde un archivo .env, como process.env.PORT o process.env.JWT_SECRET. Es importante que esto se ejecute antes de usar process.env en cualquier parte del código.

const app = express();

// Middlewares (van primero)
app.use(cors({ origin: "http://localhost:3000" })); // permite que el frontend pueda hacer solicitudes a la API del backend. El origen permitido es http://localhost:3000, que es donde corre el frontend. Esto es necesario para evitar errores de CORS cuando el frontend intenta acceder a la API.
app.use(express.json());

// 1) Auth primero (sin token)
app.use("/api/auth", require("./routes/auth.routes.cjs"));

// 2) Recién después, protegés todo lo demás
const { authRequired } = require("./middlewares/auth.cjs"); //middleware para verificar el token en las rutas protegidas. authRequired verifica el token y guarda los datos del usuario en req.user, o devuelve un error 401 si el token no es válido o no se proporciona.
app.use("/api", authRequired); //protege todas las rutas que empiecen con /api, excepto las de /api/auth que se definieron antes. Esto hace que para acceder a cualquier ruta que empiece con /api, el cliente tenga que enviar un token válido en el header Authorization: Bearer <token>.

// 3) Rutas protegidas
app.use("/api/productos", require("./routes/productos.routes")); // define las rutas para manejar los productos, como GET /api/productos para listar los productos, POST /api/productos para crear un nuevo producto, etc. Estas rutas están protegidas por el middleware authRequired, por lo que requieren un token válido para acceder.
app.use("/api/clientes", require("./routes/clientes.routes"));
app.use("/api/ventas", require("./routes/ventas.routes"));
app.use("/api/reportes", require("./routes/reportes.routes"));
app.use("/api/marcas", require("./routes/marcas.routes"));

const port = process.env.PORT || 3001; //levanta el servidor en el puerto definido en las variables de entorno o en el puerto 3001 si no se define. Es importante que esto se ejecute al final, después de definir todas las rutas y middlewares, para que el servidor esté listo para recibir solicitudes.
app.listen(port, () => console.log(`API en http://localhost:${port}`)); //inicia el servidor y muestra un mensaje en la consola indicando la URL donde está corriendo la API.