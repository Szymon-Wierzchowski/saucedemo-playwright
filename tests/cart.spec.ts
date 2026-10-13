import { expect, test } from "../fixtures/test";
import { priceOf } from "../data/products";

const chosen = ["Sauce Labs Backpack", "Sauce Labs Bolt T-Shirt"];

test.describe("Cart", () => {
  test.beforeEach(async ({ inventoryPage, header }) => {
    await inventoryPage.goto();
    for (const name of chosen) await inventoryPage.addToCart(name);
    await header.openCart();
  });

  test("lists the chosen products with quantity and price", async ({ cartPage }) => {
    await expect(cartPage.names).toHaveText(chosen);

    for (const name of chosen) {
      const row = cartPage.item(name);
      await expect(row.getByTestId("item-quantity")).toHaveText("1");
      await expect(row.getByTestId("inventory-item-price")).toHaveText(`$${priceOf(name)}`);
    }
  });

  test("removing a product leaves the others untouched", async ({ cartPage, header }) => {
    await cartPage.remove(chosen[0]);

    await expect(cartPage.names).toHaveText([chosen[1]]);
    await expect(header.cartBadge).toHaveText("1");
  });

  test("continuing shopping keeps the cart", async ({ cartPage, header, inventoryPage }) => {
    await cartPage.continueShopping.click();

    await expect(header.title).toHaveText("Products");
    await expect(header.cartBadge).toHaveText(String(chosen.length));
    await expect(inventoryPage.item(chosen[0]).getByRole("button", { name: "Remove" })).toBeVisible();
  });
});
