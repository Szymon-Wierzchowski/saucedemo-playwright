import { expect, loggedOut, test } from "../fixtures/test";
import { catalogue } from "../data/products";
import { customer, users } from "../data/users";
import type { Header } from "../pages/Header";
import type { LoginPage } from "../pages/LoginPage";

/**
 * Each test here describes how the shop SHOULD behave and is expected to fail, because the
 * behaviour is a known defect. The suite stays green while the defect exists; the day one is
 * fixed, its test passes "unexpectedly" and Playwright reports it, so the entry gets removed.
 *
 * Run with SHOW_DEFECTS=1 to see the real failures instead of the expected-failure summary.
 */
const knownDefect = (reason: string) => test.fail(!process.env.SHOW_DEFECTS, reason);

// Defects never fix themselves within 5 seconds; a short timeout keeps the expected failures quick.
const SOON = { timeout: 2_000 };

test.use(loggedOut);

async function loginAs(user: string, loginPage: LoginPage, header: Header) {
  await loginPage.goto();
  await loginPage.login(user);
  await expect(header.title).toHaveText("Products");
}

test.describe("Known defects: standard_user", () => {
  test("DEF-01 checkout is blocked while the cart is empty", async ({ page, loginPage, header, cartPage }) => {
    knownDefect("An empty cart can be checked out, producing a $0.00 order");
    await loginAs(users.standard, loginPage, header);
    await cartPage.goto();

    await cartPage.checkout();

    await expect(page).toHaveURL(/\/cart\.html$/, SOON);
  });
});

test.describe("Known defects: problem_user", () => {
  test.beforeEach(async ({ loginPage, header }) => {
    await loginAs(users.problem, loginPage, header);
  });

  test("DEF-02 every product has its own picture", async ({ inventoryPage }) => {
    knownDefect("All six products show the same placeholder image");

    const sources = await inventoryPage.images.evaluateAll((images) => images.map((img) => img.getAttribute("src")));

    expect(new Set(sources).size).toBe(catalogue.length);
  });

  test("DEF-03 sorting by name Z to A reorders the list", async ({ inventoryPage }) => {
    knownDefect("The sort dropdown has no effect");
    const expected = catalogue.map((p) => p.name).sort().reverse();

    await inventoryPage.sortBy("za");

    await expect(inventoryPage.names).toHaveText(expected, SOON);
  });

  test("DEF-04 the last name field keeps what was typed", async ({ cartPage, checkoutPage }) => {
    knownDefect("Typing a last name overwrites the first name and leaves last name empty");
    await cartPage.goto();
    await cartPage.checkout();

    await checkoutPage.firstName.fill(customer.firstName);
    await checkoutPage.lastName.fill(customer.lastName);

    await expect(checkoutPage.lastName).toHaveValue(customer.lastName, SOON);
    await expect(checkoutPage.firstName).toHaveValue(customer.firstName, SOON);
  });
});

test.describe("Known defects: error_user", () => {
  test.beforeEach(async ({ loginPage, header }) => {
    await loginAs(users.error, loginPage, header);
  });

  test("DEF-05 sorting works without an error dialog", async ({ page, inventoryPage }) => {
    knownDefect('Sorting shows an alert: "Sorting is broken!" and the list does not change');
    const dialogs: string[] = [];
    page.on("dialog", async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });

    await inventoryPage.sortBy("za");

    expect(dialogs).toEqual([]);
  });

  test("DEF-06 the Finish button places the order", async ({ page, inventoryPage, header, cartPage, checkoutPage }) => {
    knownDefect("Finish does nothing; the customer stays on the overview page");
    await inventoryPage.addToCart("Sauce Labs Backpack");
    await header.openCart();
    await cartPage.checkout();
    await checkoutPage.firstName.fill(customer.firstName);
    await checkoutPage.postalCode.fill(customer.postalCode);
    await checkoutPage.continue();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);

    await checkoutPage.finish();

    await expect(page).toHaveURL(/\/checkout-complete\.html$/, SOON);
  });
});

test.describe("Known defects: visual_user", () => {
  test("DEF-07 prices match the catalogue", async ({ loginPage, header, inventoryPage }) => {
    knownDefect("Prices on the product list are random and change on every visit");
    await loginAs(users.visual, loginPage, header);

    await expect(inventoryPage.prices).toHaveText(catalogue.map((p) => `$${p.price}`), SOON);
  });
});
