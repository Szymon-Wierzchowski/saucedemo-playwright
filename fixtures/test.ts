import { test as base } from "@playwright/test";
import { CartPage } from "../pages/CartPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { Header } from "../pages/Header";
import { InventoryPage } from "../pages/InventoryPage";
import { LoginPage } from "../pages/LoginPage";
import { ProductPage } from "../pages/ProductPage";

interface Pages {
  loginPage: LoginPage;
  header: Header;
  inventoryPage: InventoryPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
}

/** Tests ask for the page objects they need by name instead of constructing them. */
export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  header: async ({ page }, use) => use(new Header(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  productPage: async ({ page }, use) => use(new ProductPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
});

export { expect } from "@playwright/test";

/** For tests that must start logged out, overriding the saved session from the setup project. */
export const loggedOut = { storageState: { cookies: [], origins: [] } };
