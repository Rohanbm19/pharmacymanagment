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
const getOrderDetails = async (req, res) => {

    try {

        const id = req.params.id;

        const order = await orderModel.getOrderDetails(id);

        if (!order) {

            return res.status(404).json({
                message: "Order Not Found"
            });

        }

        res.json(order);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

};

module.exports = {
    placeOrder,
    getOrderDetails
};