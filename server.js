/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const expressLayouts = require("express-ejs-layouts")
const baseController = require('./controllers/baseController')
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/index")
const compression = require('compression')

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Compression Middleware
 *************************/
app.use(compression());

/* ***********************
 * Routes
 *************************/
app.use(static)
app.use("/inv", inventoryRoute)

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on http://${host}:${port}`)
})

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Intentional error route for testing
app.get("/trigger-error", utilities.handleErrors(baseController.triggerError))

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' })
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if (err.status == 404) { message = err.message } else { message = err.message ?? 'Oh no! There was a crash. Maybe try a different route?' }
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})