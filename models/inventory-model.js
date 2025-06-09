const pool = require('../database/');

/* ***************************
 *  Get all classification data
 * ************************** */
async function getAllClassification() {
  return await pool.query('SELECT * FROM public.classification ORDER BY classification_name');
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
    return [];
  }
}

/* ***************************
 *  Get specific vehicle data by inventory_id
 * ************************** */
async function getInventoryByInventoryId(inventory_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.inv_id = $1`,
      [inventory_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getInventoryByInventoryId error " + error)
  }
}

/* ***************************
 *  Get Classification by name
 * ************************** */
async function getClassificationByName(classification_name) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.classification WHERE LOWER(classification_name) = LOWER($1)`,
      [classification_name]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getClassificationByName error " + error)
    return null;
  }
}

// Add a new classification
async function addClassification(classification_name) {
  try {
    const result = await pool.query(
      `INSERT INTO public.classification (classification_name) 
      VALUES ($1) RETURNING classification_id`,
      [classification_name]
    )
    return result.rows[0].classification_id
  } catch (error) {
    console.error("addClassification error " + error)
    return null;
  }
}

/* ***************************
 *  Add a new inventory item
 * ************************** */
async function addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
  try {
    const result = await pool.query(
      `INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING inv_id`,
      [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id]
    )
    return result.rows[0].inv_id
  } catch (error) {
    console.error("addInventory error " + error)
    return null;
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_price = $4, inv_year = $5, inv_miles = $6, inv_color = $7, classification_id = $8 WHERE inv_id = $9 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

module.exports = {
  getAllClassification,
  getInventoryByClassificationId,
  getInventoryByInventoryId,
  getClassificationByName,
  addClassification,
  addInventory,
  updateInventory,
};
