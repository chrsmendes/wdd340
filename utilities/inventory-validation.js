const utilities = require(".")
const { body, validationResult } = require("express-validator")
const validate = {}
const invModel = require("../models/inventory-model")

/*  **********************************
 *  Inventory Data Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
    return [
        // make is required and must be string
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a make."),

        // model is required and must be string
        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a model."),

        // year is required and must be a 4-digit number
        body("inv_year")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .isLength({ min: 4, max: 4 })
            .withMessage("Please provide a valid 4-digit year."),

        // description is required
        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a description."),

        // price is required and must be a positive number
        body("inv_price")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .custom((value) => {
                if (parseFloat(value) < 0) {
                    throw new Error("Price must be a positive number.")
                }
                return true
            })
            .withMessage("Please provide a valid price."),

        // miles is required and must be a positive number
        body("inv_miles")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .custom((value) => {
                if (parseFloat(value) < 0) {
                    throw new Error("Miles must be a positive number.")
                }
                return true
            })
            .withMessage("Please provide valid mileage."),

        // color is required
        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .isLength({ min: 1 })
            .withMessage("Please provide a color."),

        // classification_id is required
        body("classification_id")
            .trim()
            .escape()
            .notEmpty()
            .isNumeric()
            .withMessage("Please select a classification."),
    ]
}

/*  **********************************
 *  Classification Data Validation Rules
 * ********************************* */
validate.classificationRules = () => {
    return [
        // classification_name is required and must contain only alphanumeric characters
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .isAlphanumeric()
            .withMessage("Classification name cannot be empty. No spaces or special characters allowed. Use only letters and numbers.")
            .custom(async (classification_name) => {
                const classificationExists = await invModel.getClassificationByName(classification_name)
                if (classificationExists) {
                    throw new Error("Classification already exists.")
                }
            }),
    ]
}

/* **************************************
 * Check data and return errors or continue to registration
 * ************************************* */
validate.checkInventoryData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", {
            errors,
            title: "Add Inventory",
            nav,
            classificationList,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        })
        return
    }
    next()
}

/* **************************************
 * Check data and return errors or continue to classification addition
 * ************************************* */
validate.checkClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        const classifications = await invModel.getAllClassification()
        res.render("inventory/add-classification", {
            errors,
            title: "Add a New Classification",
            nav,
            classifications: classifications.rows || [],
            classification_name
        })
        return
    }
    next()
}

/* **************************************
 * Check update data and return errors or continue to inventory update
 * ************************************* */
validate.checkUpdateData = async (req, res, next) => {
    const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let classificationSelect = await utilities.buildClassificationList(classification_id)
        const itemName = `${inv_make} ${inv_model}`
        res.render("inventory/edit-inventory", {
            errors,
            title: "Edit " + itemName,
            nav,
            classificationSelect,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        })
        return
    }
    next()
}

module.exports = validate
