const { chromium } = require("@playwright/test");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Listen to all requests
  page.on("request", (request) => {
    console.log("REQUEST:", request.method(), request.url());
  });

  // Listen to all responses
  page.on("response", (response) => {
    console.log("RESPONSE:", response.status(), response.url());
  });

  // Listen to failed requests
  page.on("requestfailed", (request) => {
    console.log("FAILED:", request.url(), request.failure()?.errorText);
  });

  await page.goto("https://rahulshettyacademy.com/loginpagePractise/");

  await page.locator("#username").fill("rahulshetty");
  await page.locator('[type="password"]').fill("learning");
  await page.locator("#signInBtn").click();

  await browser.close();
})();

await page.route("**/api/**", (route) => route.abort());

page.on("requestfailed", (request) => {
  console.log("ABORTED:", request.url(), request.failure()?.errorText);
});
