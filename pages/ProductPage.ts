import type { Locator, Page } from "@playwright/test";

export class ProductPage {
  readonly name: Locator;
  readonly price: Locator;
  readonly addToCart: Locator;
  readonly remove: Locator;
  readonly backToProducts: Locator;

  constructor(page: Page) {
    // The product list uses the same data-test names, and the URL changes before the page content does.
    // Scoping to the container that only this page has makes every locator wait for the real product page.
    const details = page.locator("#inventory_item_container");
    this.name = details.getByTestId("inventory-item-name");
    this.price = details.getByTestId("inventory-item-price");
    this.addToCart = details.getByTestId("add-to-cart");
    this.remove = details.getByTestId("remove");
    this.backToProducts = page.getByTestId("back-to-products");
  }
}
