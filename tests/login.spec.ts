import { expect, loggedOut, test } from "../fixtures/test";
import { PASSWORD, users } from "../data/users";

test.use(loggedOut);

test.describe("Login", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test("a valid user lands on the product list", { tag: "@smoke" }, async ({ page, loginPage, header }) => {
    await loginPage.login(users.standard);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(header.title).toHaveText("Products");
  });

  test("a locked-out user is told why they cannot log in", async ({ page, loginPage }) => {
    await loginPage.login(users.lockedOut);

    await expect(loginPage.error).toHaveText("Epic sadface: Sorry, this user has been locked out.");
    await expect(page).toHaveURL("/");
  });

  const invalidAttempts = [
    { name: "empty form", username: "", password: "", message: "Username is required" },
    { name: "missing password", username: users.standard, password: "", message: "Password is required" },
    { name: "missing username", username: "", password: PASSWORD, message: "Username is required" },
    {
      name: "wrong password",
      username: users.standard,
      password: "not_the_password",
      message: "Username and password do not match any user in this service",
    },
    {
      name: "unknown user",
      username: "no_such_user",
      password: PASSWORD,
      message: "Username and password do not match any user in this service",
    },
  ];

  for (const attempt of invalidAttempts) {
    test(`rejects login with ${attempt.name}`, async ({ page, loginPage }) => {
      await loginPage.login(attempt.username, attempt.password);

      await expect(loginPage.error).toHaveText(`Epic sadface: ${attempt.message}`);
      await expect(page).toHaveURL("/");
    });
  }

  test("the error message can be dismissed", async ({ loginPage }) => {
    await loginPage.login("", "");
    await expect(loginPage.error).toBeVisible();

    await loginPage.dismissError.click();

    await expect(loginPage.error).toBeHidden();
  });

  test("logging out ends the session", async ({ page, loginPage, header }) => {
    await loginPage.login(users.standard);
    await header.logout();
    await expect(page).toHaveURL("/");

    // The real check: the old session must not open protected pages any more.
    await page.goto("/inventory.html");
    await expect(loginPage.error).toContainText("You can only access '/inventory.html' when you are logged in.");
  });

  test("the slow account still logs in within 10 seconds", { tag: "@slow" }, async ({ loginPage, header }) => {
    // performance_glitch_user is deliberately slow; this guards against it getting worse, not against slowness itself.
    await loginPage.login(users.performanceGlitch);

    await expect(header.title).toHaveText("Products", { timeout: 10_000 });
  });
});

test.describe("Access without logging in", () => {
  for (const path of ["/inventory.html", "/cart.html", "/checkout-step-one.html", "/checkout-complete.html"]) {
    test(`${path} sends the visitor back to the login page`, async ({ page, loginPage }) => {
      await page.goto(path);

      await expect(page).toHaveURL("/");
      await expect(loginPage.error).toContainText(`You can only access '${path}' when you are logged in.`);
    });
  }
});
