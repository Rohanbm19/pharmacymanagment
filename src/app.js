const express = require("express");

const app = express();

app.use(express.json());

const medicineRoutes = require("./routes/medicineRoutes");
const orderRoutes = require("./routes/orderRoutes");
app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);
module.exports = app;