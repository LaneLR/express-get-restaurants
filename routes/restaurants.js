const express = require("express");
const router = express.Router();
const { Restaurant, Menu, Item } = require("../models/index");
const { check, validationResult } = require("express-validator");

router.get("/", async (req, res) => {
  const restaurants = await Restaurant.findAll({
    include: [
      {
        model: Menu,
        include: [
          {
            model: Item,
          },
        ],
      },
    ],
  });
  res.json(restaurants);
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const restaurants = await Restaurant.findByPk(id);
    res.json(restaurants);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  [
    check("name").not().isEmpty().trim().isLength({ min: 10, max: 30 }),
    check("location").not().isEmpty().trim(),
    check("cuisine").not().isEmpty().trim(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.json({message: "Didn't work"});
      return res.json({ error: errors.array() });
    }
    try {
      const { name, location, cuisine } = req.body;
      const newRestaurant = await Restaurant.create({
        name,
        location,
        cuisine,
      });
      res.json(newRestaurant);
    } catch (err) {
      next(err);
    }
  }
);

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

router.delete("/:id", async (req, res, next) => {
  try {
    const id = req.params.id - 1;
    await Restaurant.destroy({ where: { id } });
    return res.json({ message: "Restaurant deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
