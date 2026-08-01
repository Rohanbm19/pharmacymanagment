const express = require("express");
const router = express.Router();

const medicineController = require("../controllers/medicineController");

router.post("/", medicineController.addMedicine);

module.exports = router;