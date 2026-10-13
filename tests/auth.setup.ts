import { expect, test as setup } from "../fixtures/test";
import { users } from "../data/users";
import { STORAGE_STATE } from "../playwright.config";

setup("log in as the standard user and save the session", async ({ page, loginPage, header }) => {
  await loginPage.goto();
  await loginPage.login(users.standard);
  // Wait for the shop to load before saving, or the session cookie may not be set yet.
  await expect(header.title).toHaveText("Products");
  await page.context().storageState({ path: STORAGE_STATE });
});
