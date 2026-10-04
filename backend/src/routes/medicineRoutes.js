const express = require("express");
const router = express.Router();

const medicineController = require("../controllers/medicineController");
const requireAdmin = require("../middleware/requireAdmin");

router.post("/", requireAdmin, medicineController.addMedicine);
router.put("/:id/stock", requireAdmin, medicineController.updateStock);
router.put("/:id", requireAdmin, medicineController.updateMedicine);
router.get("/", medicineController.getMedicines);
router.delete("/:id", requireAdmin, medicineController.deleteMedicine);
module.exports = router;