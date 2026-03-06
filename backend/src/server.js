const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares (van primero)
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// 1) Auth primero (sin token)
app.use("/api/auth", require("./routes/auth.routes.cjs"));

// 2) Recién después, protegés todo lo demás
const { authRequired } = require("./middlewares/auth.cjs");
app.use("/api", authRequired);

// 3) Rutas protegidas
app.use("/api/productos", require("./routes/productos.routes"));
app.use("/api/clientes", require("./routes/clientes.routes"));
app.use("/api/ventas", require("./routes/ventas.routes"));
app.use("/api/reportes", require("./routes/reportes.routes"));
app.use("/api/marcas", require("./routes/marcas.routes"));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API en http://localhost:${port}`));