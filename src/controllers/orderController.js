const orderModel = require("../models/orderModel");

const placeOrder = async (req, res) => {

    try {

        const { user_id, medicine_list } = req.body;

        if (!user_id || !medicine_list || medicine_list.length === 0) {

            return res.status(400).json({
                message: "Invalid Order"
            });

        }

        const result = await orderModel.placeOrder(
            user_id,
            medicine_list
        );

        res.status(201).json(result);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    placeOrder
};