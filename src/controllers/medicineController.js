const medicineModel = require("../models/medicineModel");

const addMedicine = async (req, res) => {
    try {

        const { name, category, stock, price } = req.body;

        // Basic Validation
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

module.exports = {
    addMedicine
};