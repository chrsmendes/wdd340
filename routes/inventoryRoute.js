// Needed Resources
const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const inventoryValidate = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get(
    "/type/:classificationId",
    utilities.handleErrors(invController.buildByClassificationId)
);

// Route to build inventory detail view
router.get(
    "/detail/:invId",
    utilities.handleErrors(invController.buildByInventoryId)
);

// Route to build inventory management view
router.get(
    "/",
    utilities.checkLogin,
    utilities.checkAccountType,
    utilities.handleErrors(invController.buildInventoryManagement)
);

// Route to get inventory as JSON
router.get(
    "/getInventory/:classification_id",
    utilities.checkLogin,
    utilities.checkAccountType,
    utilities.handleErrors(invController.getInventoryJSON)
);

// Route to build add classification view
router.get(
    "/classification/add",
    utilities.checkLogin,
    utilities.checkAccountType,
    utilities.handleErrors(invController.buildAddClassification)
);

// Route to Add a new classification
router.post("/classification/add",
    utilities.checkLogin,
    utilities.checkAccountType,
    inventoryValidate.classificationRules(),
    inventoryValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
);

// Route to build add inventory view
router.get(
    "/add",
    utilities.checkLogin,
    utilities.checkAccountType,
    utilities.handleErrors(invController.buildAddInventory)
);

// Route to Add a new inventory item
router.post(
    "/add",
    utilities.checkLogin,
    utilities.checkAccountType,
    inventoryValidate.inventoryRules(),
    inventoryValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
);

// Route to build edit inventory view
router.get(
    "/edit/:inv_id",
    utilities.checkLogin,
    utilities.checkAccountType,
    utilities.handleErrors(invController.editInventoryView)
);

// Route to update inventory
router.post(
    "/update",
    utilities.checkLogin,
    utilities.checkAccountType,
    inventoryValidate.inventoryRules(),
    inventoryValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
);

// Route to build delete confirmation view
router.get(
    "/delete/:inv_id",
    utilities.checkLogin,
    utilities.checkAccountType,
    utilities.handleErrors(invController.deleteInventoryView)
);

// Route to delete inventory
router.post(
    "/delete",
    utilities.checkLogin,
    utilities.checkAccountType,
    utilities.handleErrors(invController.deleteInventory)
);

// Route to build add review view
router.get(
    "/review/:invId",
    utilities.checkLogin,
    utilities.checkClientType,
    utilities.handleErrors(invController.buildAddReviewView)
);

// Route to add a review
router.post(
    "/review",
    utilities.checkLogin,
    utilities.checkClientType,
    utilities.handleErrors(invController.addReview)
);

module.exports = router;
