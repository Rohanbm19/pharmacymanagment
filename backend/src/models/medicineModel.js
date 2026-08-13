const pool = require("../config/db");

const addMedicine = async (name, category, stock, price) => {
    const query = `
        INSERT INTO medicines(name, category, stock, price)
        VALUES($1,$2,$3,$4)
    `;

    await pool.query(query, [name, category, stock, price]);
};

const updateStock = async (id, stock) => {
    const query = `
        UPDATE medicines
        SET stock = $1
        WHERE id = $2
    `;

    await pool.query(query, [stock, id]);
};

const updateMedicine = async (id, name, category, stock, price) => {
    const query = `
        UPDATE medicines
        SET
            name = COALESCE($1, name),
            category = COALESCE($2, category),
            stock = COALESCE($3, stock),
            price = COALESCE($4, price)
        WHERE id = $5
    `;

    await pool.query(query, [name, category, stock, price, id]);
};

const getMedicines = async () => {

    const query = `
        SELECT * FROM medicines
        ORDER BY id;
    `;

    const result = await pool.query(query);

    return result.rows;

};

const deleteMedicine = async (id) => {
    const query = `
        DELETE FROM medicines
        WHERE id = $1
    `;
    await pool.query(query, [id]);
};

module.exports = {
    addMedicine,
    updateStock,
    updateMedicine,
    getMedicines,
    deleteMedicine
};