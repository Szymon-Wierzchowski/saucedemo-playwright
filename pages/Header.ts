import type { Locator, Page } from "@playwright/test";

/** The bar shared by every page after login: menu and cart. */
export class Header {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly title: Locator;

  constructor(private readonly page: Page) {
    this.cartLink = page.getByTestId("shopping-cart-link");
    this.cartBadge = page.getByTestId("shopping-cart-badge");
    this.title = page.getByTestId("title");
  }

  async openCart() {
    await this.cartLink.click();
  }

  async logout() {
    await this.page.getByRole("button", { name: "Open Menu" }).click();
    await this.page.getByTestId("logout-sidebar-link").click();
  }
}
