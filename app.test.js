const request = require("supertest");
const app = require("./src/app");
const {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
} = require("@jest/globals");
const Restaurant = require("./models/index");
const db = require("./db/connection");

describe("app can", () => {
  beforeAll(async () => {
    await Restaurant.destroy({ where: { name: null } });
    await Restaurant.destroy({ where: { name: "See's Candy" } });
    await Restaurant.destroy({ where: { name: "KFC" } });
    await Restaurant.destroy({ where: { name: "Jojo's Candy" } });
    await db.sync();
  });

  afterAll(async () => {
    await db.close();
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
});
