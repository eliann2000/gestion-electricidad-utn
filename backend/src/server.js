const express = require("express");
const cors = require("cors"); // permite solicitudes desde el frontend
require("dotenv").config();

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes.cjs"));


const { authRequired } = require("./middlewares/auth.cjs");
app.use("/api", authRequired); // todas las rutas que empiecen con API pasan por authRequired

app.use("/api/productos", require("./routes/productos.routes"));
app.use("/api/clientes", require("./routes/clientes.routes"));
app.use("/api/ventas", require("./routes/ventas.routes"));
app.use("/api/reportes", require("./routes/reportes.routes"));
app.use("/api/marcas", require("./routes/marcas.routes"));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API en http://localhost:${port}`));