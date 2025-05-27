const utilities = require('../utilities/');
const baseController = {};

baseController.buildHome = async (req, res) => {
    const nav = await utilities.getNav();
    res.render('index', { title: 'Home', nav });
};

/* ***************************
 *  Trigger an intentional error for testing
 * ************************** */
baseController.triggerError = async (req, res) => {
    throw new Error('This is an intentional 500 error for testing purposes.');
};

module.exports = baseController;
