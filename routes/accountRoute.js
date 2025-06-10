// Needed Resources
const express = require("express");
const router = express.Router();
const utilities = require("../utilities/");
const accountController = require("../controllers/accountController");
const regValidate = require('../utilities/account-validation');

// Route to handle account login page
router.get("/login", utilities.handleErrors(accountController.buildLogin));
// Route to handle account registration page
router.get("/register", utilities.handleErrors(accountController.buildRegister));
// Route to handle default account management view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement));

// Process the registration data
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
);

// Process the login attempt
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
);

// Route to handle account update view
router.get("/update/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountUpdate));

// Route to process account update
router.post(
    "/update",
    utilities.checkLogin,
    regValidate.accountUpdateRules(),
    regValidate.checkAccountUpdateData,
    utilities.handleErrors(accountController.updateAccount)
);

// Route to process password update
router.post(
    "/update-password",
    utilities.checkLogin,
    regValidate.passwordUpdateRules(),
    regValidate.checkPasswordUpdateData,
    utilities.handleErrors(accountController.updatePassword)
);

// Route to handle logout
router.get("/logout", utilities.handleErrors(accountController.accountLogout));

module.exports = router;
