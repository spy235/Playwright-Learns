import { test, expect } from "@playwright/test";

test("Teacher Login", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("http://localhost:5173/teacher/login");
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Teacher Login - Student Tracker/);

  await page.locator("#email").fill("testusermap1@gmail.com");
  await page.locator("input[name='password']").fill("Yashas@235@");
  await page.locator("#login-btn").click();

  console.log(
    await page
      .locator('div[class="go2072408551"] div[role="status"]')
      .innerText(),
  );
  //textcontent() - fetches from the raw dom  Includes: hidden text, spacing/newlines from DOM
  //expect(await page.locator('div[class="go2072408551"] div[role="status"]').textContent()).toEqual("Welcome back!")

  // best is to use
  await expect(
    page.locator('div[class="go2072408551"] div[role="status"]'),
  ).toHaveText("Welcome back!");

  // innertext() visible text, rendered text seen by user
  expect(await page.locator("div h2").innerText()).toEqual("StudentTracker");
});

test("Get Student Metrics", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("http://localhost:5173/teacher/login");
  // Expect a title "to contain" a substring.

  // wait until the application loads completely
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveTitle(/Teacher Login - Student Tracker/);

  await page.locator("#email").fill("testusermap1@gmail.com");
  await page.locator("input[name='password']").fill("Yashas@235@");
  await page.locator("#login-btn").click();
  await expect(
    page.locator('div[class="go2072408551"] div[role="status"]'),
  ).toHaveText("Welcome back!");

  expect(await page.locator("div h2").innerText()).toEqual("StudentTracker");

  await page.waitForSelector("#kpi-passed h3");

  const metricsList = await page.locator("h3").allInnerTexts();

  console.log(metricsList);
  console.log(await page.locator("h3").nth(4).textContent());
});

test("UI Controls", async ({ page }) => {
  await page.goto("")
})