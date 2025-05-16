const express = require("express");
const app = express();
const Restaurant = require("../models/index");
const db = require("../db/connection");

app.get("/restaurants", async (req, res) => {
    const restaurants = await Restaurant.findAll({});
    res.json(restaurants)
})

module.exports = app;
