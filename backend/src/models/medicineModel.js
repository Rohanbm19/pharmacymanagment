const supabase = require("../config/db");

const addMedicine = async (name, category, stock, price) => {
    const { error } = await supabase
        .from("medicines")
        .insert({ name, category, stock, price });
    if (error) throw error;
};

const updateStock = async (id, stock) => {
    const { error } = await supabase
        .from("medicines")
        .update({ stock, updated_at: new Date().toISOString() })
        .eq("id", id);
    if (error) throw error;
};

const updateMedicine = async (id, name, category, stock, price) => {
    const updates = Object.fromEntries(
        Object.entries({ name, category, stock, price }).filter(([, value]) => value != null)
    );
    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
        .from("medicines")
        .update(updates)
        .eq("id", id);
    if (error) throw error;
};

const getMedicines = async () => {
    const { data, error } = await supabase
        .from("medicines")
        .select("*")
        .order("id", { ascending: true });
    if (error) throw error;
    return data;
};

const deleteMedicine = async (id) => {
    const { error } = await supabase
        .from("medicines")
        .delete()
        .eq("id", id);
    if (error) throw error;
};

module.exports = {
    addMedicine,
    updateStock,
    updateMedicine,
    getMedicines,
    deleteMedicine
};