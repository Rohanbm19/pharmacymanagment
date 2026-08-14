const pool = require("../config/db");
const redisClient = require("../config/redis");

const placeOrder = async (userId, medicineList, customerName = null) => {

    const client = await pool.connect();

    try {

        // Simple Redis Lock
        const lock = await redisClient.set(
            "order_lock",
            "locked",
            {
                NX: true,
                EX: 10
            }
        );

        if (!lock) {
            throw new Error("Another order is being processed. Please try again.");
        }

        await client.query("BEGIN");

        let totalPrice = 0;

        for (const item of medicineList) {

            const medicineResult = await client.query(
                "SELECT * FROM medicines WHERE id=$1",
                [item.medicine_id]
            );

            if (medicineResult.rows.length === 0) {
                throw new Error("Medicine not found");
            }

            const medicine = medicineResult.rows[0];

            if (medicine.stock < item.quantity) {
                throw new Error(`${medicine.name} is out of stock`);
            }

            totalPrice += medicine.price * item.quantity;
        }

        const order = await client.query(

            `INSERT INTO orders(user_id, customer_name, total_price)
             VALUES($1,$2,$3)
             RETURNING *`,

            [userId, customerName, totalPrice]

        );

        const orderId = order.rows[0].id;

        for (const item of medicineList) {

            await client.query(

                `INSERT INTO order_items
                (order_id,medicine_id,quantity)
                VALUES($1,$2,$3)`,

                [
                    orderId,
                    item.medicine_id,
                    item.quantity
                ]

            );

            await client.query(

                `UPDATE medicines
                 SET stock = stock - $1
                 WHERE id = $2`,

                [
                    item.quantity,
                    item.medicine_id
                ]

            );

        }

        await client.query("COMMIT");

        await redisClient.del("medicines"); // Clear cached medicine list
        await redisClient.del("order_lock"); // Release lock

        return {
            message: "Order Placed Successfully",
            order_id: orderId
        };

    } catch (error) {

        await client.query("ROLLBACK");
        await redisClient.del("order_lock");

        throw error;

    } finally {

        client.release();

    }

};
const getOrderDetails = async (orderId) => {

    const query = `
        SELECT
            o.id AS order_id,
            o.user_id,
            o.customer_name,
            o.total_price,
            o.order_date,
            m.name,
            oi.quantity,
            m.price
        FROM orders o
        JOIN order_items oi
            ON o.id = oi.order_id
        JOIN medicines m
            ON oi.medicine_id = m.id
        WHERE o.id = $1;
    `;

    const result = await pool.query(query, [orderId]);

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows;

};

module.exports = {
    placeOrder,
    getOrderDetails
};