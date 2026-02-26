const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API funcionando" });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API en http://localhost:${port}`));