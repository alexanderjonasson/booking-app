import { expect, test } from "@playwright/test";
import {
  createService,
  createTimeSlot,
  makeAdmin,
  removeService,
  resetDatabase,
} from "./db";
import { daysFromNow, signIn, signUp, toDateInputValue } from "./helpers";

test.beforeEach(async () => {
  await resetDatabase();
});

test("a customer can book a time and cancel it", async ({ page }) => {
  await createTimeSlot(daysFromNow(1, 9), daysFromNow(1, 10));

  await signUp(page, "Kim Customer", "kim@example.test");

  const available = page.getByRole("region", { name: "Available times" });
  const myBookings = page.getByRole("region", { name: "Your bookings" });

  await available.getByRole("button", { name: /^Book / }).click();

  await expect(myBookings.getByRole("listitem")).toHaveCount(1);
  await expect(available).toContainText("There are no available times");

  await myBookings.getByRole("button", { name: /^Cancel Consultation/ }).click();

  await expect(myBookings).toContainText("You have no upcoming bookings");
  await expect(available.getByRole("listitem")).toHaveCount(1);
});

test("a booked time is not shown to other customers", async ({
  page,
  browser,
}) => {
  await createTimeSlot(daysFromNow(2, 13), daysFromNow(2, 14));

  await signUp(page, "Kim Customer", "kim@example.test");
  await page
    .getByRole("region", { name: "Available times" })
    .getByRole("button", { name: /^Book / })
    .click();
  await expect(
    page.getByRole("region", { name: "Your bookings" }).getByRole("listitem"),
  ).toHaveCount(1);

  // A second customer in a separate browser session
  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  await signUp(otherPage, "Bo Customer", "bo@example.test");

  await expect(
    otherPage.getByRole("region", { name: "Available times" }),
  ).toContainText("There are no available times");
  await otherContext.close();
});

test("a signed out visitor is asked to sign in before booking", async ({
  page,
}) => {
  await createTimeSlot(daysFromNow(1, 9), daysFromNow(1, 10));

  await page.goto("/");
  await page.getByRole("link", { name: "Sign in to book" }).click();

  await expect(page).toHaveURL("/sign-in");
});

test("an admin can add a time and customers can see it", async ({
  page,
  browser,
}) => {
  await createService("Consultation", 45);
  await signUp(page, "Anna Admin", "admin@example.test");
  await makeAdmin("admin@example.test");

  await page.getByRole("button", { name: "Sign out" }).click();
  await signIn(page, "admin@example.test");
  await page.getByRole("link", { name: "Admin" }).click();

  const day = daysFromNow(3, 0);
  await page.getByLabel("Service").selectOption({ label: "Consultation (45 min)" });
  await page.getByLabel("Date").fill(toDateInputValue(day));
  await page.getByLabel("Start").fill("10:00");
  await page.getByRole("button", { name: "Add time" }).click();

  await expect(page.getByRole("main").getByRole("status")).toHaveText("The time was added");
  const upcoming = page.getByRole("region", { name: "Upcoming times" });
  // The end time comes from the 45 minute service
  await expect(upcoming).toContainText("Consultation");
  await expect(upcoming).toContainText("10:00–10:45");

  // Adding a time that overlaps is stopped
  await page.getByLabel("Date").fill(toDateInputValue(day));
  await page.getByLabel("Start").fill("10:30");
  await page.getByRole("button", { name: "Add time" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "This time overlaps with an existing time",
  );

  // A customer can see the new time
  const customerContext = await browser.newContext();
  const customerPage = await customerContext.newPage();
  await customerPage.goto("/");
  await expect(
    customerPage.getByRole("region", { name: "Available times" }),
  ).toContainText("Consultation");
  await customerContext.close();
});

test("times for a removed service are not shown to customers", async ({
  page,
}) => {
  const serviceId = await createService("Old service", 30);
  await createTimeSlot(daysFromNow(1, 9), daysFromNow(1, 10), serviceId);
  await createTimeSlot(daysFromNow(1, 11), daysFromNow(1, 12));

  await removeService(serviceId);
  await page.goto("/");

  const available = page.getByRole("region", { name: "Available times" });
  await expect(available.getByRole("listitem")).toHaveCount(1);
  await expect(available).not.toContainText("Old service");
});

test("the admin is asked to add a service before adding times", async ({
  page,
}) => {
  await signUp(page, "Anna Admin", "admin@example.test");
  await makeAdmin("admin@example.test");
  await page.goto("/admin");

  await expect(page.getByText("You need a service first.")).toBeVisible();
  await page.getByRole("link", { name: "Add a service" }).click();
  await expect(page).toHaveURL("/admin/services");
});

test("a customer cannot open the admin page", async ({ page }) => {
  await signUp(page, "Kim Customer", "kim@example.test");

  await page.goto("/admin");

  await expect(page).toHaveURL("/");
  await expect(page.getByRole("link", { name: "Admin" })).toHaveCount(0);
});

test("a signed out visitor is sent to sign in from the admin page", async ({
  page,
}) => {
  await page.goto("/admin");

  await expect(page).toHaveURL("/sign-in");
});
