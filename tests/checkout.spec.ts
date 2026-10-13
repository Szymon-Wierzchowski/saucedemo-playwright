import { expect, test } from "../fixtures/test";
import { TAX_RATE, priceOf, toCents } from "../data/products";
import { customer } from "../data/users";

const chosen = ["Sauce Labs Backpack", "Sauce Labs Bolt T-Shirt"];

test.describe("Checkout", () => {
  test.beforeEach(async ({ inventoryPage, header, cartPage }) => {
    await inventoryPage.goto();
    for (const name of chosen) await inventoryPage.addToCart(name);
    await header.openCart();
    await cartPage.checkout();
  });

  test("a customer can buy the products in the cart", { tag: "@smoke" }, async ({ page, checkoutPage, header }) => {
    await checkoutPage.fillCustomer(customer);
    await checkoutPage.continue();

    await expect(checkoutPage.itemNames).toHaveText(chosen);

    await checkoutPage.finish();

    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkoutPage.confirmation).toHaveText("Thank you for your order!");
    await expect(header.cartBadge).toBeHidden(); // the order must empty the cart
  });

  test("the overview adds up: items, 8% tax and total", async ({ checkoutPage }) => {
    await checkoutPage.fillCustomer(customer);
    await checkoutPage.continue();

    // Expected values come from the catalogue, not from the page, so a wrong price on the page is caught too.
    const subtotal = toCents(chosen.reduce((sum, name) => sum + priceOf(name), 0));
    const tax = toCents(subtotal * TAX_RATE);

    expect(await checkoutPage.amounts()).toEqual({ subtotal, tax, total: toCents(subtotal + tax) });
  });

  const incomplete = [
    { missing: "first name", data: { ...customer, firstName: undefined }, message: "First Name is required" },
    { missing: "last name", data: { ...customer, lastName: undefined }, message: "Last Name is required" },
    { missing: "postal code", data: { ...customer, postalCode: undefined }, message: "Postal Code is required" },
  ];

  for (const { missing, data, message } of incomplete) {
    test(`cannot continue without a ${missing}`, async ({ page, checkoutPage }) => {
      await checkoutPage.fillCustomer(data);
      await checkoutPage.continue();

      await expect(checkoutPage.error).toHaveText(`Error: ${message}`);
      await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    });
  }

  test("cancelling the customer form returns to the cart with nothing lost", async ({ page, checkoutPage, cartPage }) => {
    await checkoutPage.cancelButton.click();

    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(cartPage.names).toHaveText(chosen);
  });

  test("cancelling on the overview does not place the order", async ({ page, checkoutPage, header }) => {
    await checkoutPage.fillCustomer(customer);
    await checkoutPage.continue();

    await checkoutPage.cancelButton.click();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(header.cartBadge).toHaveText(String(chosen.length));
  });
});
