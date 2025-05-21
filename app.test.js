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

jest.mock("./models/index", () => ({
  Restaurant: {
    create: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Menu: {
    create: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    addItems: jest.fn(),
  },
  Item: {
    create: jest.fn(),
    findAll: jest.fn(),
    count: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    addMenus: jest.fn(),
  },
}));

describe("app", () => {
  beforeAll(async () => {
    jest.clearAllMocks();
    await db.sync();
  });

  afterAll(async () => {
    await db.close({ force: true });
  });

  test("can get restaurants", async () => {
    const restaurants = await request(app).get("/restaurants");
    expect(restaurants.statusCode).toEqual(200);
  });

  test("gets the right data", async () => {
    const data = { id: 1, name: "LongEnoughName", location: "Kentucky", cuisine: "Fried" };
    Restaurant.count.mockResolvedValue(3)
    Restaurant.findAll.mockResolvedValue([data])
    Restaurant.create.mockResolvedValue(data);
    await Restaurant.create(data)
    const restaurants = await request(app).get("/restaurants");
    const amount = await Restaurant.count();

    expect(data.name).toEqual("LongEnoughName");
    expect(amount).toEqual(3);
    expect(restaurants.body).toEqual([data])
  });

  test("posts a restaurant", async () => {
    const data = { id: 1, name: "LongEnoughName", location: "Kentucky", cuisine: "Fried" };
    Restaurant.create.mockResolvedValue(data);
    expect(data.cuisine).toEqual("Fried");

    const response = await request(app)
      .post("/restaurants")
      .send(data);

    // expect(Restaurant.create).toHaveBeenCalledWith(data)
    expect(response.statusCode).toEqual(200)
    expect(response.body).toEqual(data)
  });

  test("deletes a restaurant", async () => {
    const data = { id: 1, name: "LongEnoughName", location: "Kentucky", cuisine: "Fried" };
    Restaurant.create.mockResolvedValue(data);
    expect(data.cuisine).toEqual("Fried");

    const response = await request(app)
      .post("/restaurants")
      .send(data);
    
    Restaurant.destroy.mockResolvedValue(1);
    const deleted = await request(app)
    .delete(`/restaurants/${data.id}`)
    expect(deleted.body).toEqual({ message: "Restaurant deleted." });
  });

  test("updates a restaurant", async () => {
    const data = { id: 1, name: "LongEnoughName", location: "Kentucky", cuisine: "Fried" };
    Restaurant.create.mockResolvedValue(data);
    expect(data.cuisine).toEqual("Fried");
    const newData = {name: "YesThisIsALongName", location: "DFW", cuisine: "Pies"}

    const response = await request(app)
      .post("/restaurants")
      .send(data);
    
    Restaurant.update.mockResolvedValue([1]);
    const updated = await request(app)
    .put(`/restaurants/${data.id}`)
    .send(newData)
    expect(updated.statusCode).toBe(200);
    expect(Restaurant.update).toHaveBeenCalledWith(
    newData,
    { where: { id: `${data.id}` } }
  );  
});

  test("can create a Menu and Item", async () => {
    const mockWineMenu = {
      addItems: jest.fn(),
    };
    const mockDessertsMenu = {
      addItems: jest.fn(),
    };

    const mockRestaurant = {
      addMenu: jest.fn(),
    };

    const mockItem = {}; // mock items can be plain objects if not using methods

    Menu.create = jest.fn()
      .mockResolvedValueOnce(mockWineMenu)     // wineMenu
      .mockResolvedValueOnce(mockDessertsMenu); // dessertsMenu

    Item.create = jest.fn()
      .mockResolvedValue(mockItem); // or use mockResolvedValueOnce repeatedly

    Restaurant.findByPk = jest.fn()
      .mockResolvedValue(mockRestaurant); // use once per restaurant if needed

    // now your original code works as expected:
    const wineMenu = await Menu.create({ title: "Wines" });
    const dessertsMenu = await Menu.create({ title: "Desserts" });
    
    const dinner1 = await Item.create({
      name: "Steak",
      image: "img1",
      price: 27.99,
      vegetarian: false,
    });
    const dinner2 = await Item.create({
      name: "Ribs",
      image: "img2",
      price: 23.98,
      vegetarian: false,
    });
    const dinner3 = await Item.create({
      name: "Tofu Steak",
      image: "img3",
      price: 29.99,
      vegetarian: true,
    });
    const wine1 = await Item.create({
      name: "Red Wine",
      image: "img4",
      price: 17.99,
      vegetarian: true,
    });
    const wine2 = await Item.create({
      name: "White Wine",
      image: "img5",
      price: 15.99,
      vegetarian: true,
    });

    const appbees = await Restaurant.findByPk(1);
    const littleSheep = await Restaurant.findByPk(2);
    const spiceGrill = await Restaurant.findByPk(3);
    await wineMenu.addItems([wine1, wine2]);
    await dessertsMenu.addItems([dinner1, dinner2, dinner3]);
    await appbees.addMenu(wineMenu);
    await littleSheep.addMenu(wineMenu);
    await spiceGrill.addMenu(dessertsMenu);
  });

  test("if errors are thrown", async () => {
    const newRestaurant = await request(app)
      .post("/resturants")
      .send({ name: "Jojo's Candy", location: "Miami" });
    expect(newRestaurant.body).toEqual({});
  });

  test("if name must be between 10 and 30 characters", async () => {
    const tooShort = await request(app)
      .post("/restaurants")
      .send({ name: "Candy", location: "Miami", cuisine: "Candy" });
    const goodLength = await request(app)
      .post("/restaurants")
      .send({ name: "CandyLand's Candy", location: "Miami", cuisine: "Candy" });
    const tooLong = await request(app).post("/restaurants").send({
      name: "This is a very long name for a restaurant",
      location: "Miami",
      cuisine: "Candy",
    });

    expect(tooShort.body.error[0].msg).toEqual("Invalid value");
    expect(goodLength.status).toEqual(200);
    expect(tooLong.body.error[0].msg).toEqual("Invalid value");
  });
});
