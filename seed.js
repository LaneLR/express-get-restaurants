const { Restaurant, Menu, Item } = require("./models/index");
const { seedRestaurant, seedItem, seedMenu } = require("./seedData");
const db = require("./db/connection");

const syncSeed = async () => {
  await db.sync({ force: true });
  await Restaurant.bulkCreate(seedRestaurant);
  await Item.bulkCreate(seedItem);
  await Menu.bulkCreate(seedMenu);
};

syncSeed();
