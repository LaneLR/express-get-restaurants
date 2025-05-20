const Restaurant = require("./Restaurant");
const Item = require("./Item");
const Menu = require("./Menu");

Restaurant.hasMany(Menu)
Menu.belongsTo(Restaurant)

Menu.belongsToMany(Item, {through: "MenuItems"})
Item.belongsToMany(Menu, {through: "MenuItems"})

module.exports = { Restaurant, Menu, Item };
