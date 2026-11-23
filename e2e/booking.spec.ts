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

test("a customer can book a time with a message and cancel it", async ({
  page,
}) => {
  await createTimeSlot(daysFromNow(1, 9), daysFromNow(1, 10));

  await signUp(page, "Kim Customer", "kim@example.test");

  const available = page.getByRole("region", { name: "Available times" });
  const myBookings = page.getByRole("region", { name: "Your bookings" });

  // Book opens a page where the booking is confirmed
  await available.getByRole("link", { name: /^Book / }).click();
  await expect(page).toHaveURL(/\/book\/\d+$/);
  await expect(page.getByRole("heading", { name: "Consultation" })).toBeVisible();

  await page.getByLabel("Message").fill("I want to talk about my website");
  await page.getByRole("button", { name: "Confirm booking" }).click();

  await expect(page).toHaveURL("/?booked=1");
  await expect(page.getByRole("main").getByRole("status")).toHaveText(
    "Your booking is confirmed. See you then!",
  );
  await expect(myBookings.getByRole("listitem")).toHaveCount(1);
  await expect(myBookings).toContainText("I want to talk about my website");
  await expect(available).toContainText("There are no available times");

  await myBookings.getByRole("button", { name: /^Cancel Consultation/ }).click();

  await expect(myBookings).toContainText("You have no upcoming bookings");
  await expect(available.getByRole("listitem")).toHaveCount(1);
});

test("the back button on the booking page does not book", async ({ page }) => {
  await createTimeSlot(daysFromNow(1, 9), daysFromNow(1, 10));
  await signUp(page, "Kim Customer", "kim@example.test");

  await page
    .getByRole("region", { name: "Available times" })
    .getByRole("link", { name: /^Book / })
    .click();
  await page.getByRole("link", { name: "Back" }).click();

  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("region", { name: "Your bookings" }),
  ).toContainText("You have no upcoming bookings");
});

test("a customer is told when someone else booked the time first", async ({
  page,
  browser,
}) => {
  await createTimeSlot(daysFromNow(1, 9), daysFromNow(1, 10));

  // Two customers open the same booking page at the same time
  await signUp(page, "Kim Customer", "kim@example.test");
  await page
    .getByRole("region", { name: "Available times" })
    .getByRole("link", { name: /^Book / })
    .click();

  const otherContext = await browser.newContext();
  const otherPage = await otherContext.newPage();
  await signUp(otherPage, "Bo Customer", "bo@example.test");
  await otherPage
    .getByRole("region", { name: "Available times" })
    .getByRole("link", { name: /^Book / })
    .click();

  // Bo confirms first
  await otherPage.getByRole("button", { name: "Confirm booking" }).click();
  await expect(otherPage).toHaveURL("/?booked=1");
  await otherContext.close();

  // Kim's page is still open, but the database stops a second booking
  await page.getByLabel("Message").fill("See you soon");
  await page.getByRole("button", { name: "Confirm booking" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText(
    "Sorry, someone just booked this time",
  );
  // The message Kim wrote is still there
  await expect(page.getByLabel("Message")).toHaveValue("See you soon");
});

test("a booking page for a time that is gone says so", async ({ page }) => {
  await signUp(page, "Kim Customer", "kim@example.test");

  await page.goto("/book/9999");

  await expect(
    page.getByRole("heading", { name: "This time is no longer available" }),
  ).toBeVisible();
});

test("a signed out visitor is sent to sign in from a booking page", async ({
  page,
}) => {
  await createTimeSlot(daysFromNow(1, 9), daysFromNow(1, 10));

  await page.goto("/book/1");

  await expect(page).toHaveURL("/sign-in");
});

test("a booked time is not shown to other customers", async ({
  page,
  browser,
}) => {
  await createTimeSlot(daysFromNow(2, 13), daysFromNow(2, 14));

  await signUp(page, "Kim Customer", "kim@example.test");
  await page
    .getByRole("region", { name: "Available times" })
    .getByRole("link", { name: /^Book / })
    .click();
  await page.getByRole("button", { name: "Confirm booking" }).click();
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

test("the admin sees who booked and their message", async ({ page, browser }) => {
  await createTimeSlot(daysFromNow(1, 9), daysFromNow(1, 10));

  const customerContext = await browser.newContext();
  const customerPage = await customerContext.newPage();
  await signUp(customerPage, "Kim Customer", "kim@example.test");
  await customerPage
    .getByRole("region", { name: "Available times" })
    .getByRole("link", { name: /^Book / })
    .click();
  await customerPage.getByLabel("Message").fill("Please call me first");
  await customerPage.getByRole("button", { name: "Confirm booking" }).click();
  await expect(customerPage).toHaveURL("/?booked=1");
  await customerContext.close();

  await signUp(page, "Anna Admin", "admin@example.test");
  await makeAdmin("admin@example.test");
  await page.goto("/admin");

  const upcoming = page.getByRole("region", { name: "Upcoming times" });
  await expect(upcoming).toContainText("Booked by Kim Customer");
  await expect(upcoming).toContainText("Message: Please call me first");
});
