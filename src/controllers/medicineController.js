const medicineModel = require("../models/medicineModel");

// Add Medicine
const addMedicine = async (req, res) => {
    try {
        const { name, category, stock, price } = req.body;

        if (!name || !category || stock == null || price == null) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        await medicineModel.addMedicine(name, category, stock, price);

        res.status(201).json({
            message: "Medicine added successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Update Stock
const updateStock = async (req, res) => {
    try {

        const id = req.params.id;
        const { stock } = req.body;

        if (stock == null) {
            return res.status(400).json({
                message: "Stock is required"
            });
        }

        await medicineModel.updateStock(id, stock);

        if (stock < 10) {
            console.log("⚠ LOW STOCK ALERT!");
        }

        res.json({
            message: "Stock updated successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    addMedicine,
    updateStock
};