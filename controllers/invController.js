const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)

  if (data.length === 0) {
    req.flash("notice", "Sorry, no vehicles found for this classification.")
    return res.status(404).render("./inventory/classification", {
      title: "No Vehicles Found",
      nav: await utilities.getNav(),
      grid: '<p class="notice">No vehicles found for this classification.</p>',
    })
  }

  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.invId
  const vehicle = await invModel.getInventoryByInventoryId(inv_id)
  const vehicleDetail = await utilities.buildVehicleDetail(vehicle)
  let nav = await utilities.getNav()
  const vehicleName = vehicle.inv_make + ' ' + vehicle.inv_model
  res.render("./inventory/detail", {
    title: vehicleName,
    nav,
    vehicleDetail,
  })
}

/* ***************************
  *  Build inventory management view
  * ************************** */
invCont.buildInventoryManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
  })
}

/* ***************************
  *  Build add classification view
  * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classifications = await invModel.getAllClassification().catch((error) => {
    console.error("Error fetching classifications: ", error)
    req.flash("notice", "Error fetching classifications.")
    return []
  })
  res.render("./inventory/add-classification", {
    title: "Add a New Classification",
    nav,
    classifications: classifications.rows || [],
  })
}

/* ***************************
  *  Add a new classification
  * ************************** */
invCont.addClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body

  const isValidName = /^[a-zA-Z0-9]+$/.test(classification_name)

  // Validate classification name
  if (!classification_name || classification_name.trim() === "" || !isValidName) {
    req.flash("notice", "Classification name cannot be empty, No spaces or special characters allowed. Use only letters and numbers.")
    const classifications = await invModel.getAllClassification()
    return res.status(400).render("./inventory/add-classification", {
      title: "Add a New Classification",
      nav,
      classifications: classifications.rows || [],
      errors: null,
      classification_name,
    })
  }
  // Check if classification already exists
  const existingClassification = await invModel.getClassificationByName(classification_name)
  if (existingClassification && existingClassification.classification_name.toLowerCase() === classification_name.toLowerCase()) {
    req.flash("notice", "Classification already exists.")
    const classifications = await invModel.getAllClassification()
    return res.status(400).render("./inventory/add-classification", {
      title: "Add a New Classification",
      nav,
      classifications: classifications.rows || [],
      errors: null,
      classification_name,
    })
  }

  // Add new classification
  const result = await invModel.addClassification(classification_name)

  if (result) {
    req.flash("notice", "Classification added successfully.")
    return res.redirect("/inv")
  }
  else {
    req.flash("notice", "Error adding classification.")
    console.error("Error adding classification: ", result)
    const classifications = await invModel.getAllClassification()
    return res.status(500).render("./inventory/add-classification", {
      title: "Add a New Classification",
      nav,
      classifications: classifications.rows || [],
      errors: null,
      classification_name,
    })
  }
}

/* ***************************
  *  Build add inventory view
  * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("./inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: null,
  })
}

/* ***************************
  *  Add a new inventory item
  * ************************** */
invCont.addInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const { inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id } = req.body

  const inv_image = "/images/vehicles/no-image.png"
  const inv_thumbnail = "/images/vehicles/no-image-tn.png"

  // Add new inventory item
  const result = await invModel.addInventory(
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
  )

  if (result) {
    req.flash("notice", "Inventory item added successfully.")
    return res.redirect("/inv")
  } else {
    req.flash("notice", "Error adding inventory item.")
    let classificationList = await utilities.buildClassificationList(classification_id)
    return res.status(500).render("./inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors: null,
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
  }
}

module.exports = invCont