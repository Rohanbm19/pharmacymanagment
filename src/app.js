const express = require("express");

const app = express();

app.use(express.json());

const medicineRoutes = require("./routes/medicineRoutes");

app.use("/api/medicines", medicineRoutes);

module.exports = app;