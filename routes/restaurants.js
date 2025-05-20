const express = require("express");
const router = express.Router();
const Restaurant = require("../models/index");

router.get("/", async (req, res) => {
  const restaurants = await Restaurant.findAll();
  res.json(restaurants);
});

router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id - 1;
    const restaurants = await Restaurant.findByPk(id);
    res.json(restaurants);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, location, cuisine } = req.body;
    const newRestaurant = await Restaurant.create({ name, location, cuisine });
    res.json(newRestaurant);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { name, location, cuisine } = req.body;

  await Restaurant.update(
    { name, location, cuisine },
    {
      where: { id },
    }
  );

  const updatedRestaurant = await Restaurant.findByPk(id);
  res.json(updatedRestaurant); 
});

router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id - 1;
    const deleteRestaurant = await Restaurant.destroy({ where: { id } });
    res.json({ message: "Restaurant deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
