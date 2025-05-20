const request = require("supertest");
const app = require("./src/app");
const {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
} = require("@jest/globals");
const { Restaurant, Menu, Item } = require("./models/index");
const db = require("./db/connection");

describe("app can", () => {
  beforeAll(async () => {
    await Restaurant.destroy({ where: { name: null } });
    await Restaurant.destroy({ where: { name: "See's Candy" } });
    await Restaurant.destroy({ where: { name: "KFC" } });
    await Restaurant.destroy({ where: { name: "Jojo's Candy" } });
    await Menu.destroy({ where: { title: null } });
    await Menu.destroy({ where: { title: "Wines" } });
    await Menu.destroy({ where: { title: "Desserts" } });
    await Item.destroy({ where: { name: null } });
    await Item.destroy({ where: { name: "Steak" } });
    await Item.destroy({ where: { name: "Ribs" } });
    await Item.destroy({ where: { name: "Tofu Steak" } });
    await Item.destroy({ where: { name: "Red Wine" } });
    await Item.destroy({ where: { name: "White Wine" } });
    await db.sync();
  });

  afterAll(async () => {
    await db.close({force: true});
  });

  test("can get restaurants", async () => {
    const restaurants = await request(app).get("/restaurants");
    expect(restaurants.statusCode).toEqual(200);
  });

  test("gets the right data", async () => {
    const restaurants = await request(app).get("/restaurants");
    const amount = await Restaurant.count();
    expect(restaurants.body[0].name).toEqual("AppleBees");
    expect(amount).toEqual(3);
  });

  test("posts a restaurant", async () => {
    const createRestaurant = await request(app)
      .post("/restaurants")
      .send({ name: "KFC", location: "Kentucky", cuisine: "Fried" });
    const id = createRestaurant.body.id;

    expect(createRestaurant.body.id).toEqual(id);
    expect(createRestaurant.body.cuisine).toEqual("Fried");
  });

  test("deletes a restaurant", async () => {
    const createRestaurant = await request(app)
      .post("/restaurants")
      .send({ name: "See's Candy", location: "NYC", cuisine: "Candy" });
    const id = createRestaurant.body.id;
    const deleteRestaurant = await request(app).delete(`/restaurants/${id}`);
    expect(deleteRestaurant.statusCode).toBe(200);
    expect(deleteRestaurant.body).toEqual({ message: "Restaurant deleted." });
  });

  test("updates a restaurant", async () => {
    const createRes = await request(app)
      .post("/restaurants")
      .send({ name: "Jojo's Candy", location: "Miami", cuisine: "Candy" });
    const id = createRes.body.id;
    const updateRes1 = await request(app)
      .put(`/restaurants/${id}`)
      .send({ name: "Jojo's Candy", location: "El Paso", cuisine: "Candy" });
    expect(updateRes1.statusCode).toBe(200);
    expect(updateRes1.body.location).toEqual("El Paso");;
  });

    test("can create a Menu and Item", async () => {
      const wineMenu = await Menu.create({title: "Wines"})
      const dessertsMenu = await Menu.create({title: "Desserts"})
      const dinner1 = await Item.create({name: "Steak", image: "img1", price: 27.99, vegetarian: false})
      const dinner2 = await Item.create({name: "Ribs", image: "img2", price: 23.98, vegetarian: false})
      const dinner3 = await Item.create({name: "Tofu Steak", image: "img3", price: 29.99, vegetarian: true})
      const wine1 = await Item.create({name: "Red Wine", image: "img4", price: 17.99, vegetarian: true})
      const wine2 = await Item.create({name: "White Wine", image: "img5", price: 15.99, vegetarian: true})
      const appbees = await Restaurant.findByPk(1)
      const littleSheep = await Restaurant.findByPk(2)
      const spiceGrill = await Restaurant.findByPk(3)
      await wineMenu.addItems([wine1, wine2])
      await dessertsMenu.addItems([dinner1, dinner2, dinner3])
      await appbees.addMenu(wineMenu)
      await littleSheep.addMenu(wineMenu)
      await spiceGrill.addMenu(dessertsMenu)
  });
});
