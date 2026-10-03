const medicineModel = require("../models/medicineModel");
const redisClient = require("../config/redis");
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

        // Invalidate Redis cache if available
        try {
            if (redisClient.isOpen) {
                await redisClient.del("medicines");
            }
        } catch (redisError) {
            console.error("Redis del error:", redisError.message);
        }

        // Notify connected clients to refresh medicines
        try {
            if (global.io) global.io.emit('medicines:updated', { action: 'add' });
        } catch (ioError) {
            console.error('Socket emit error:', ioError.message);
        }

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

        try {
            if (global.io) global.io.emit("lowStock", {
                message: "Medicine stock is below 10",
                medicineId: id,
                stock: stock
            });
        } catch (ioError) {
            console.error('Socket emit error:', ioError.message);
        }

    }

            // Invalidate Redis cache and notify clients about update
            try {
                if (redisClient.isOpen) {
                    await redisClient.del("medicines");
                }
            } catch (redisError) {
                console.error("Redis del error:", redisError.message);
            }

            try {
                if (global.io) global.io.emit('medicines:updated', { action: 'update', id });
            } catch (ioError) {
                console.error('Socket emit error:', ioError.message);
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
const getMedicines = async (req, res) => {
    try {
        let cachedData = null;
        try {
            // Check Redis
            if (redisClient.isOpen) {
                cachedData = await redisClient.get("medicines");
            }
        } catch (redisError) {
            console.error("Redis get error:", redisError.message);
        }

        if (cachedData) {
            return res.json({
                source: "Redis Cache",
                medicines: JSON.parse(cachedData)
            });
        }

        // Fetch from Supabase
        const medicines = await medicineModel.getMedicines();

        try {
            // Store in Redis for 60 seconds
            if (redisClient.isOpen) {
                await redisClient.setEx(
                    "medicines",
                    60,
                    JSON.stringify(medicines)
                );
            }
        } catch (redisError) {
            console.error("Redis set error:", redisError.message);
        }

        res.json({
            source: "Supabase",
            medicines
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

const deleteMedicine = async (req, res) => {
    try {
        const id = req.params.id;
        await medicineModel.deleteMedicine(id);

        // Invalidate Redis cache and notify clients
        try {
            if (redisClient.isOpen) {
                await redisClient.del("medicines");
            }
        } catch (redisError) {
            console.error("Redis del error:", redisError.message);
        }

        try {
            if (global.io) global.io.emit('medicines:updated', { action: 'delete', id });
        } catch (ioError) {
            console.error('Socket emit error:', ioError.message);
        }

        res.json({
            message: "Medicine deleted successfully"
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// Update medicine details (name, category, stock, price)
const updateMedicine = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, category, stock, price } = req.body;

        // Basic validation
        if (!name && !category && stock == null && price == null) {
            return res.status(400).json({ message: 'At least one field is required to update' });
        }

        await medicineModel.updateMedicine(id, name, category, stock, price);

        // Invalidate Redis cache and notify clients
        try {
            if (redisClient.isOpen) {
                await redisClient.del("medicines");
            }
        } catch (redisError) {
            console.error("Redis del error:", redisError.message);
        }

        try {
            if (global.io) global.io.emit('medicines:updated', { action: 'update', id });
        } catch (ioError) {
            console.error('Socket emit error:', ioError.message);
        }

        res.json({ message: 'Medicine updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    addMedicine,
    updateStock,
    updateMedicine,
    getMedicines,
    deleteMedicine
};