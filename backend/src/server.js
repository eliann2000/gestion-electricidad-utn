const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middlewares (van primero)
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Rutas
app.use("/api/productos", require("./routes/productos.routes"));
app.use("/api/clientes", require("./routes/clientes.routes"));
app.use("/api/ventas", require("./routes/ventas.routes"));
app.use("/api/reportes", require("./routes/reportes.routes"));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API funcionando" });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API en http://localhost:${port}`));