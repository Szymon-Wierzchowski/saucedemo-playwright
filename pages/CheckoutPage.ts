import type { Locator, Page } from "@playwright/test";
import { parseMoney } from "../data/products";

export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** Covers the three checkout steps: customer details, overview, confirmation. */
export class CheckoutPage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;
  readonly error: Locator;
  readonly itemNames: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly confirmation: Locator;

  constructor(page: Page) {
    this.firstName = page.getByTestId("firstName");
    this.lastName = page.getByTestId("lastName");
    this.postalCode = page.getByTestId("postalCode");
    this.continueButton = page.getByTestId("continue");
    this.cancelButton = page.getByTestId("cancel");
    this.finishButton = page.getByTestId("finish");
    this.error = page.getByTestId("error");
    this.itemNames = page.getByTestId("inventory-item-name");
    this.subtotal = page.getByTestId("subtotal-label");
    this.tax = page.getByTestId("tax-label");
    this.total = page.getByTestId("total-label");
    this.confirmation = page.getByTestId("complete-header");
  }

  /** Fills only the fields that are given, so tests can leave one out on purpose. */
  async fillCustomer(customer: Partial<Customer>) {
    if (customer.firstName !== undefined) await this.firstName.fill(customer.firstName);
    if (customer.lastName !== undefined) await this.lastName.fill(customer.lastName);
    if (customer.postalCode !== undefined) await this.postalCode.fill(customer.postalCode);
  }

  async continue() {
    await this.continueButton.click();
  }

  async finish() {
    await this.finishButton.click();
  }

  async amounts() {
    return {
      subtotal: parseMoney(await this.subtotal.innerText()),
      tax: parseMoney(await this.tax.innerText()),
      total: parseMoney(await this.total.innerText()),
    };
  }
}
