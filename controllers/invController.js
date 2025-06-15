const invModel = require("../models/inventory-model")
const reviewModel = require("../models/review-model")
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
  const reviews = await reviewModel.getReviewsByInventoryId(inv_id)
  let nav = await utilities.getNav()
  const vehicleName = vehicle.inv_make + ' ' + vehicle.inv_model
  res.render("./inventory/detail", {
    title: vehicleName,
    nav,
    vehicleDetail,
    reviews,
    inv_id,
  })
}

/* ***************************
  *  Build inventory management view
  * ************************** */
invCont.buildInventoryManagement = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
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

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryByInventoryId(inv_id)

  if (!itemData || !itemData.inv_id) {
    throw new Error("Item not found or invalid inventory ID")
  }

  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.deleteInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getInventoryByInventoryId(inv_id)

  if (!itemData || !itemData.inv_id) {
    throw new Error("Item not found or invalid inventory ID")
  }

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price
  })
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id)

  const deleteResult = await invModel.deleteInventoryItem(inv_id)

  if (deleteResult) {
    req.flash("notice", "The inventory item was successfully deleted.")
    res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the delete failed.")
    res.redirect(`/inv/delete/${inv_id}`)
  }
}

/* ***************************
 *  Build add review view
 * ************************** */
invCont.buildAddReviewView = async function (req, res, next) {
  const inv_id = req.params.invId
  const vehicle = await invModel.getInventoryByInventoryId(inv_id)
  let nav = await utilities.getNav()
  const vehicleName = vehicle.inv_make + ' ' + vehicle.inv_model

  // Check if user already reviewed this vehicle
  if (res.locals.loggedin) {
    const hasReviewed = await reviewModel.checkExistingReview(inv_id, res.locals.accountData.account_id)
    if (hasReviewed) {
      req.flash("notice", "You have already reviewed this vehicle.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }
  }

  res.render("./inventory/add-review", {
    title: "Add Review - " + vehicleName,
    nav,
    vehicle,
    inv_id,
    errors: null,
    review_rating: "",
    review_text: "",
  })
}

/* ***************************
 *  Process add review
 * ************************** */
invCont.addReview = async function (req, res, next) {
  const { inv_id, review_rating, review_text } = req.body
  const account_id = res.locals.accountData.account_id
  let nav = await utilities.getNav()

  try {
    // Check if user already reviewed this vehicle
    const hasReviewed = await reviewModel.checkExistingReview(inv_id, account_id)
    if (hasReviewed) {
      req.flash("notice", "You have already reviewed this vehicle.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }

    const result = await reviewModel.addReview(inv_id, account_id, review_rating, review_text)

    if (result) {
      req.flash("notice", "Your review has been added successfully!")
      res.redirect(`/inv/detail/${inv_id}`)
    } else {
      req.flash("notice", "Sorry, there was an error adding your review.")
      const vehicle = await invModel.getInventoryByInventoryId(inv_id)
      res.render("./inventory/add-review", {
        title: "Add Review - " + vehicle.inv_make + ' ' + vehicle.inv_model,
        nav,
        vehicle,
        inv_id,
        errors: null,
        review_rating,
        review_text,
      })
    }
  } catch (error) {
    req.flash("notice", "Sorry, there was an error adding your review.")
    const vehicle = await invModel.getInventoryByInventoryId(inv_id)
    res.render("./inventory/add-review", {
      title: "Add Review - " + vehicle.inv_make + ' ' + vehicle.inv_model,
      nav,
      vehicle,
      inv_id,
      errors: null,
      review_rating,
      review_text,
    })
  }
}

module.exports = invCont