const express = require("express");
const router = express.Router();

const medicineController = require("../controllers/medicineController");

router.post("/", medicineController.addMedicine);
router.put("/:id/stock", medicineController.updateStock);
router.get("/", medicineController.getMedicines);
module.exports = router;