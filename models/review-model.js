const pool = require('../database/');

/* ***************************
 *  Add a new review
 * ************************** */
async function addReview(inv_id, account_id, review_rating, review_text) {
    try {
        const sql = `INSERT INTO public.reviews (inv_id, account_id, review_rating, review_text) 
                 VALUES ($1, $2, $3, $4) RETURNING *`;
        const result = await pool.query(sql, [inv_id, account_id, review_rating, review_text]);
        return result.rows[0];
    } catch (error) {
        console.error("addReview error: " + error);
        throw error;
    }
}

/* ***************************
 *  Get all reviews for a specific vehicle
 * ************************** */
async function getReviewsByInventoryId(inv_id) {
    try {
        const sql = `SELECT r.*, a.account_firstname, a.account_lastname 
                 FROM public.reviews r
                 INNER JOIN public.account a ON r.account_id = a.account_id
                 WHERE r.inv_id = $1
                 ORDER BY r.review_date DESC`;
        const result = await pool.query(sql, [inv_id]);
        return result.rows;
    } catch (error) {
        console.error("getReviewsByInventoryId error: " + error);
        return [];
    }
}

/* ***************************
 *  Get all reviews by a specific user
 * ************************** */
async function getReviewsByAccountId(account_id) {
    try {
        const sql = `SELECT r.*, i.inv_make, i.inv_model, i.inv_year
                 FROM public.reviews r
                 INNER JOIN public.inventory i ON r.inv_id = i.inv_id
                 WHERE r.account_id = $1
                 ORDER BY r.review_date DESC`;
        const result = await pool.query(sql, [account_id]);
        return result.rows;
    } catch (error) {
        console.error("getReviewsByAccountId error: " + error);
        return [];
    }
}

/* ***************************
 *  Check if user already reviewed this vehicle
 * ************************** */
async function checkExistingReview(inv_id, account_id) {
    try {
        const sql = `SELECT review_id FROM public.reviews 
                 WHERE inv_id = $1 AND account_id = $2`;
        const result = await pool.query(sql, [inv_id, account_id]);
        return result.rows.length > 0;
    } catch (error) {
        console.error("checkExistingReview error: " + error);
        return false;
    }
}

module.exports = {
    addReview,
    getReviewsByInventoryId,
    getReviewsByAccountId,
    checkExistingReview
};
