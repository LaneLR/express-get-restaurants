const express = require("express");
const app = express();
const Restaurant = require("../models/index");
const db = require("../db/connection");

app.use(express.json())
app.use(express.urlencoded())

app.get("/restaurants", async (req, res) => {
    const restaurants = await Restaurant.findAll({});
    res.json(restaurants)
})

app.get("/restaurants/:id", async (req, res) => {
    const id = req.params.id;
    const restaurant = await Restaurant.findByPk(id)
    res.json(restaurant)
})

app.post("/restaurants/", async (req, res) => {
    const newRestaurant = await Restaurant.create(req.body)
    res.json(newRestaurant);
})

app.put("/restaurants/:id", async (req, res) => {
    id = req.params.id
    const updatedRestaurant = await Restaurant.update(req.body, {where: {id: id}})
    res.json(updatedRestaurant);
})

app.delete("/restaurants/:id", async (req, res) => {
    id = req.params.id
    const deletedRestaurant = await Restaurant.destroy({where: {id: id}})
    res.json(deletedRestaurant);
})


module.exports = app;
