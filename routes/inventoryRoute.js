// Needed Resources
const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities/");
const inventoryValidate = require("../utilities/inventory-validation");

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

// Route to build inventory management view
router.get("/", utilities.handleErrors(invController.buildInventoryManagement));

// Route to build add classification view
router.get("/classification/add", utilities.handleErrors(invController.buildAddClassification));

// Route to Add a new classification
router.post("/classification/add",
    inventoryValidate.classificationRules(),
    inventoryValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
);

// Route to build add inventory view
router.get("/add", utilities.handleErrors(invController.buildAddInventory));

// Route to Add a new inventory item
router.post("/add",
    inventoryValidate.inventoryRules(),
    inventoryValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
);

module.exports = router;
