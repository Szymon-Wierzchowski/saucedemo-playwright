import { expect, test } from "../fixtures/test";
import { catalogue, parseMoney } from "../data/products";

test.describe("Product list", () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test("shows every product with its price", async ({ inventoryPage }) => {
    await expect(inventoryPage.names).toHaveText(catalogue.map((p) => p.name));
    await expect(inventoryPage.prices).toHaveText(catalogue.map((p) => `$${p.price}`));
  });

  test("every product has its own picture", async ({ inventoryPage }) => {
    const sources = await inventoryPage.images.evaluateAll((images) => images.map((img) => img.getAttribute("src")));

    expect(new Set(sources).size).toBe(catalogue.length);
  });

  test.describe("sorting", () => {
    const byName = catalogue.map((p) => p.name).sort();
    const byPrice = catalogue.map((p) => p.price).sort((a, b) => a - b);

    test("by name, A to Z", async ({ inventoryPage }) => {
      await inventoryPage.sortBy("az");
      await expect(inventoryPage.names).toHaveText(byName);
    });

    test("by name, Z to A", async ({ inventoryPage }) => {
      await inventoryPage.sortBy("za");
      await expect(inventoryPage.names).toHaveText([...byName].reverse());
    });

    // Two products cost the same, so price sorting is checked on prices; their relative order is not specified.
    test("by price, low to high", async ({ inventoryPage }) => {
      await inventoryPage.sortBy("lohi");
      await expect.poll(async () => (await inventoryPage.prices.allInnerTexts()).map(parseMoney)).toEqual(byPrice);
    });

    test("by price, high to low", async ({ inventoryPage }) => {
      await inventoryPage.sortBy("hilo");
      await expect
        .poll(async () => (await inventoryPage.prices.allInnerTexts()).map(parseMoney))
        .toEqual([...byPrice].reverse());
    });
  });

  test("adding and removing products updates the cart badge", { tag: "@smoke" }, async ({ inventoryPage, header }) => {
    await expect(header.cartBadge).toBeHidden();

    await inventoryPage.addToCart("Sauce Labs Backpack");
    await expect(header.cartBadge).toHaveText("1");

    await inventoryPage.addToCart("Sauce Labs Onesie");
    await expect(header.cartBadge).toHaveText("2");

    await inventoryPage.remove("Sauce Labs Backpack");
    await expect(header.cartBadge).toHaveText("1");

    await inventoryPage.remove("Sauce Labs Onesie");
    await expect(header.cartBadge).toBeHidden();
  });

  test("the cart survives a page reload", async ({ page, inventoryPage, header }) => {
    await inventoryPage.addToCart("Sauce Labs Bike Light");

    await page.reload();

    await expect(header.cartBadge).toHaveText("1");
    await expect(inventoryPage.item("Sauce Labs Bike Light").getByRole("button", { name: "Remove" })).toBeVisible();
  });

  test("the product page shows the same name and price as the list", async ({ inventoryPage, productPage, header }) => {
    const product = catalogue[3];

    await inventoryPage.open(product.name);

    await expect(productPage.name).toHaveText(product.name);
    await expect(productPage.price).toHaveText(`$${product.price}`);

    await productPage.addToCart.click();
    await expect(header.cartBadge).toHaveText("1");
    await expect(productPage.remove).toBeVisible();

    await productPage.backToProducts.click();
    await expect(header.title).toHaveText("Products");
  });
});
