export interface Product {
  name: string;
  price: number;
}

/** The shop's fixed catalogue: the source of truth the tests compare the page against. */
export const catalogue: Product[] = [
  { name: "Sauce Labs Backpack", price: 29.99 },
  { name: "Sauce Labs Bike Light", price: 9.99 },
  { name: "Sauce Labs Bolt T-Shirt", price: 15.99 },
  { name: "Sauce Labs Fleece Jacket", price: 49.99 },
  { name: "Sauce Labs Onesie", price: 7.99 },
  { name: "Test.allTheThings() T-Shirt (Red)", price: 15.99 },
];

export const TAX_RATE = 0.08;

export const priceOf = (name: string): number => {
  const product = catalogue.find((p) => p.name === name);
  if (!product) throw new Error(`Unknown product: ${name}`);
  return product.price;
};

/** "$29.99" -> 29.99, "Item total: $45.98" -> 45.98 */
export const parseMoney = (text: string): number => {
  const match = text.match(/\$(\d+(?:\.\d+)?)/);
  if (!match) throw new Error(`No price found in "${text}"`);
  return Number(match[1]);
};

/** Rounds to cents; plain float maths gives 45.980000000000004 for 29.99 + 15.99. */
export const toCents = (amount: number): number => Math.round(amount * 100) / 100;
