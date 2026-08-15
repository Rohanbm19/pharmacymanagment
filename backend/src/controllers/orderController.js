const orderModel = require("../models/orderModel");

const placeOrder = async (req, res) => {

    try {

        // Accept either a user_id (existing user) or a customer_name
        const { user_id, medicine_list, customer_name } = req.body;

        if ((!user_id && !customer_name) || !medicine_list || medicine_list.length === 0) {
            return res.status(400).json({
                message: "Invalid Order"
            });
        }

        // pass user_id (may be null) and customer_name to model
        const result = await orderModel.placeOrder(
            user_id || null,
            medicine_list,
            customer_name || null
        );

        if (global.io) {
            global.io.emit('orders:updated', { action: 'create', order_id: result.order_id });
        }

        // Attach customer_name to response so frontend can display it even if no user record exists
        const response = Object.assign({}, result, { customer_name: customer_name || null });

        res.status(201).json(response);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: error.message
        });

    }

};

const getOrders = async (req, res) => {
    try {
        const orders = await orderModel.getOrders();
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
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
    getOrders,
    getOrderDetails
};