const express = require("express");
const app = express();
const restaurantRoutes = require("../routes/restaurants")

app.use(express.json())
app.use(express.urlencoded())

app.use("/restaurants", restaurantRoutes)


module.exports = app;
