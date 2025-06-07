const invModel = require('../models/inventory-model');
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getAllClassification();
  let list = '<ul>';
  list += '<li><a href="/" title="Home Page">Home</a></li>';
  data.rows.forEach((row) => {
    list += '<li>';
    list += '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      '</a>';
    list += '</li>';
  });
  list += '</ul>';
  return list;
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => {
      grid += '<li>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id
        + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
        + 'details"><img src="' + vehicle.inv_thumbnail
        + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
        + ' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$'
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else {
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* **************************************
* Build the vehicle detail view HTML
* ************************************ */
Util.buildVehicleDetail = function (vehicle) {
  let detail
  if (vehicle) {
    detail = '<div class="vehicle-detail">'
    detail += '<div class="vehicle-image">'
    detail += '<img src="' + vehicle.inv_image + '" alt="' + vehicle.inv_make + ' ' + vehicle.inv_model + '">'
    detail += '</div>'
    detail += '<div class="vehicle-info">'
    detail += '<h2>' + vehicle.inv_make + ' ' + vehicle.inv_model + ' Details</h2>'
    detail += '<div class="price"><strong>Price: $' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</strong></div>'
    detail += '<p><strong>Year:</strong> ' + vehicle.inv_year + '</p>'
    detail += '<p><strong>Make:</strong> ' + vehicle.inv_make + '</p>'
    detail += '<p><strong>Model:</strong> ' + vehicle.inv_model + '</p>'
    detail += '<p><strong>Mileage:</strong> ' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + ' miles</p>'
    detail += '<p><strong>Color:</strong> ' + vehicle.inv_color + '</p>'
    if (vehicle.inv_description) {
      detail += '<div class="description">'
      detail += '<h3>Description</h3>'
      detail += '<p>' + vehicle.inv_description + '</p>'
      detail += '</div>'
    }
    detail += '</div>'
    detail += '</div>'
  } else {
    detail = '<p class="notice">Sorry, no vehicle details could be found.</p>'
  }
  return detail
}

/* **************************************
* Build the classification list for inventory form
* ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getAllClassification()
  let classificationList = '<label for="classificationList">Classification</label>'
  classificationList += '<select name="classification_id" id="classificationList" class="form-control" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util;
