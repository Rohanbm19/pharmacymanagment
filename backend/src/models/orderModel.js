const supabase = require("../config/db");
const redisClient = require("../config/redis");

const placeOrder = async (userId, medicineList, customerName = null) => {
    const { data, error } = await supabase.rpc("place_order_atomic", {
        p_customer_name: customerName,
        p_user_id: userId,
        p_items: medicineList
    });
    if (error) throw error;

    if (redisClient.isOpen) {
        try {
            await redisClient.del("medicines");
        } catch (cacheError) {
            console.error("Redis cache invalidation failed after placing order:", cacheError.message);
        }
    }

    return data;
};

const getOrders = async () => {
    const { data, error } = await supabase
        .from("orders")
        .select("id, customer_name, order_date, status, total_price, order_items(quantity)")
        .order("order_date", { ascending: false });
    if (error) throw error;

    return data.map((order) => ({
        id: order.id,
        customer: order.customer_name,
        date: order.order_date,
        status: order.status,
        amount: order.total_price,
        items: order.order_items.reduce((total, item) => total + item.quantity, 0),
        payment: "Pending"
    }));
};

const getOrderDetails = async (orderId) => {
    const { data, error } = await supabase
        .from("orders")
        .select("id, user_id, customer_name, total_price, order_date, order_items(quantity, medicines(name, price))")
        .eq("id", orderId)
        .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    return data.order_items.map((item) => ({
        order_id: data.id,
        user_id: data.user_id,
        customer_name: data.customer_name,
        total_price: data.total_price,
        order_date: data.order_date,
        name: item.medicines.name,
        quantity: item.quantity,
        price: item.medicines.price
    }));
};

module.exports = {
    placeOrder,
    getOrders,
    getOrderDetails
};