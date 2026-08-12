const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const medicineRoutes = require("./routes/medicineRoutes");
const orderRoutes = require("./routes/orderRoutes");
app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);
module.exports = app;