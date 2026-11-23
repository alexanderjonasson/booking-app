import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { makeAdmin, resetDatabase } from "./db";
import { signIn, signUp } from "./helpers";

test.beforeEach(async () => {
  await resetDatabase();
});

async function signInAsAdmin(page: Page) {
  await signUp(page, "Anna Admin", "admin@example.test");
  await makeAdmin("admin@example.test");
  await page.getByRole("button", { name: "Sign out" }).click();
  await signIn(page, "admin@example.test");
}

test("an admin can add and remove a service", async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto("/admin/services");

  const services = page.getByRole("region", { name: "Services", exact: true });
  await expect(services).toContainText("No services yet");

  await page.getByLabel("Name").fill("Consultation");
  await page.getByLabel("Length").selectOption({ label: "1 h 30 min" });
  await page
    .getByLabel("Description")
    .fill("A first meeting to talk about your needs");
  await page.getByRole("button", { name: "Add service" }).click();

  await expect(page.getByRole("main").getByRole("status")).toHaveText(
    "The service was added",
  );
  await expect(services).toContainText("Consultation");
  await expect(services).toContainText("1 h 30 min");
  await expect(services).toContainText("A first meeting to talk about your needs");

  await services.getByRole("button", { name: "Remove Consultation" }).click();
  await expect(services).toContainText("No services yet");
});

test("the service form explains what is wrong", async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto("/admin/services");

  // Only spaces: the browser accepts it, but the server says no
  await page.getByLabel("Name").fill("   ");
  await page.getByLabel("Length").selectOption({ label: "45 min" });
  await page.getByLabel("Description").fill("Some text");
  await page.getByRole("button", { name: "Add service" }).click();

  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "Give the service a name",
  );
  // What the admin typed and picked is still there
  await expect(page.getByLabel("Length")).toHaveValue("45");
  await expect(page.getByLabel("Description")).toHaveValue("Some text");
});

test("a customer cannot open the services page", async ({ page }) => {
  await signUp(page, "Kim Customer", "kim@example.test");

  await page.goto("/admin/services");

  await expect(page).toHaveURL("/");
});

test("the services page has no accessibility problems", async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto("/admin/services");
  await expect(page.getByRole("heading", { name: "Add a service" })).toBeVisible();

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
