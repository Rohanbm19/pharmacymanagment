const pool = require("../config/db");
const redisClient = require("../config/redis");

const placeOrder = async (userId, medicineList) => {

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

            `INSERT INTO orders(user_id,total_price)
             VALUES($1,$2)
             RETURNING *`,

            [userId, totalPrice]

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

module.exports = {
    placeOrder
};