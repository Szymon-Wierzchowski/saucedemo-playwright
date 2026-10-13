import type { Locator, Page } from "@playwright/test";

export type SortOrder = "az" | "za" | "lohi" | "hilo";

export class InventoryPage {
  readonly items: Locator;
  readonly names: Locator;
  readonly prices: Locator;
  readonly images: Locator;
  readonly sort: Locator;

  constructor(private readonly page: Page) {
    this.items = page.getByTestId("inventory-item");
    this.names = page.getByTestId("inventory-item-name");
    this.prices = page.getByTestId("inventory-item-price");
    this.images = page.getByTestId(/^inventory-item-.+-img$/);
    this.sort = page.getByTestId("product-sort-container");
  }

  async goto() {
    await this.page.goto("/inventory.html");
  }

  /** The card of one product, found by its visible name rather than by position. */
  item(name: string): Locator {
    return this.items.filter({ has: this.page.getByText(name, { exact: true }) });
  }

  async addToCart(name: string) {
    await this.item(name).getByRole("button", { name: "Add to cart" }).click();
  }

  async remove(name: string) {
    await this.item(name).getByRole("button", { name: "Remove" }).click();
  }

  async open(name: string) {
    // Each card has two links to the product (picture and title); the title one is the stable choice.
    await this.item(name).getByTestId(/-title-link$/).click();
  }

  async sortBy(order: SortOrder) {
    await this.sort.selectOption(order);
  }
}
