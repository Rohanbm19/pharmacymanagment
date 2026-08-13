const express = require("express");
const router = express.Router();

const medicineController = require("../controllers/medicineController");

router.post("/", medicineController.addMedicine);
router.put("/:id/stock", medicineController.updateStock);
router.put("/:id", medicineController.updateMedicine);
router.get("/", medicineController.getMedicines);
router.delete("/:id", medicineController.deleteMedicine);
module.exports = router;