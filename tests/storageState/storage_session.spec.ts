import test, { expect } from "@playwright/test";

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("https://rahulshettyacademy.com/client/#/auth/login");

  // Login
  await page.locator("#userEmail").fill("testusermap1@gmail.com");
  await page.getByPlaceholder("enter your passsword").fill("Yashas@235@");
  await page.locator("input[value='Login']").click();

  await expect(page.locator("#toast-container")).toContainText(
    "Login Successful",
  );

  await page.waitForLoadState("networkidle");
  await context.storageState({ path: "state.json" });
  /*{
  "cookies": [],
  "origins": [
    {
      "origin": "https://rahulshettyacademy.com",
      "localStorage": [
        {
          "name": "token",
          "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2E1OTlkN2UyYjU0NDNiMWY0YjQyNjUiLCJ1c2VyRW1haWwiOiJ0ZXN0dXNlcm1hcDFAZ21haWwuY29tIiwidXNlck1vYmlsZSI6OTg3NjU0MzIxMCwidXNlclJvbGUiOiJjdXN0b21lciIsImlhdCI6MTc4MTc2MTAyNywiZXhwIjoxODEzMzE4NjI3fQ.FrXGbHJGrZPllFf54FiMzxenEbbm0S5zorggNAgUaAE"
        }
      ]
    }
  ]
} */
});

test("storage_state test", async ({ page }) => {
  await page.goto("https://rahulshettyacademy.com/client/#/auth/login");
});
