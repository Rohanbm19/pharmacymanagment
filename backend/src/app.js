const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const medicineRoutes = require("./routes/medicineRoutes");
const orderRoutes = require("./routes/orderRoutes");
const aiRoutes = require("./routes/aiRoutes");

app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/ai", aiRoutes);

module.exports = app;