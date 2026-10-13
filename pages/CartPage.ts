import type { Locator, Page } from "@playwright/test";

export class CartPage {
  readonly items: Locator;
  readonly names: Locator;
  readonly checkoutButton: Locator;
  readonly continueShopping: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId("inventory-item");
    this.names = page.getByTestId("inventory-item-name");
    this.checkoutButton = page.getByTestId("checkout");
    this.continueShopping = page.getByTestId("continue-shopping");
  }

  async goto() {
    await this.page.goto("/cart.html");
  }

  item(name: string): Locator {
    return this.items.filter({ has: this.page.getByText(name, { exact: true }) });
  }

  async remove(name: string) {
    await this.item(name).getByRole("button", { name: "Remove" }).click();
  }

  async checkout() {
    await this.checkoutButton.click();
  }
}
