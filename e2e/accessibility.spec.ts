import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { createTimeSlot, resetDatabase } from "./db";
import { daysFromNow, signUp } from "./helpers";

// axe checks each page against the WCAG 2.1 A and AA rules,
// for example colour contrast, labels on inputs and button names.
async function checkAccessibility(page: import("@playwright/test").Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(results.violations).toEqual([]);
}

test.beforeEach(async () => {
  await resetDatabase();
  await createTimeSlot(daysFromNow(1, 9), daysFromNow(1, 10));
});

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`in ${colorScheme} mode`, () => {
    test.use({ colorScheme });

    test("the start page has no accessibility problems", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("region", { name: "Available times" })).toBeVisible();
      await checkAccessibility(page);
    });

    test("the sign in and sign up pages have no accessibility problems", async ({
      page,
    }) => {
      await page.goto("/sign-in");
      await checkAccessibility(page);
      await page.goto("/sign-up");
      await checkAccessibility(page);
    });

    test("the start page for a signed in customer has no accessibility problems", async ({
      page,
    }) => {
      await signUp(page, "Kim Customer", "kim@example.test");
      await expect(page.getByRole("region", { name: "Your bookings" })).toBeVisible();
      await checkAccessibility(page);
    });
  });
}
