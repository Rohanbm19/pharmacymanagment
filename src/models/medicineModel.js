const pool = require("../config/db");

const addMedicine = async (name, category, stock, price) => {

    const query = `
        INSERT INTO medicines(name, category, stock, price)
        VALUES($1,$2,$3,$4)
    `;

    await pool.query(query, [
        name,
        category,
        stock,
        price
    ]);
};

module.exports = {
    addMedicine
};