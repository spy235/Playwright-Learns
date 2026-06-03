import { test, expect } from "@playwright/test";

test("Place Order", async ({ page }) => {
  await page.goto("https://rahulshettyacademy.com/client/#/auth/login");

  // Login
  await page.locator("#userEmail").fill("testusermap1@gmail.com");
  await page.getByPlaceholder("enter your passsword").fill("Yashas@235@");
  await page.locator("input[value='Login']").click();

  await expect(page.locator("#toast-container")).toContainText(
    "Login Successful"
  );

  // Wait for products to load
  const products = page.locator("#products .card");
  await products.first().waitFor();

  // Add ZARA COAT 3 to cart
  const productCount = await products.count();

  for (let i = 0; i < productCount; i++) {
    const product = products.nth(i);
    const productName = await product.locator("h5").textContent();

    if (productName?.trim() === "ZARA COAT 3") {
      await product.getByRole("button", { name: /add to cart/i }).click();
      break;
    }
  }

  // Verify cart count
  await expect(
    page.locator("[routerlink='/dashboard/cart'] label")
  ).toHaveText("1");

  // Open cart
  await page.locator("[routerlink='/dashboard/cart']").click();

  // Wait for spinner
  await expect(page.locator("ngx-spinner")).toBeHidden();

  // Verify product in cart
  await expect(page.getByText("ZARA COAT 3")).toBeVisible();

  // Checkout
  await page.getByText("Checkout").click();

  // Select expiry month
  await page.locator("select.input.ddl").first().selectOption("02");

  // Select country
  await page.getByPlaceholder("Select Country").type("Afg", {
    delay: 200,
  });

  const countryOptions = page.locator(".ta-results button");
  await countryOptions.first().waitFor();

  const countryCount = await countryOptions.count();

  for (let i = 0; i < countryCount; i++) {
    const countryName = await countryOptions.nth(i).textContent();

    if (countryName?.trim() === "Afghanistan") {
      await countryOptions.nth(i).click();
      break;
    }
  }

  // Place order
  await page.getByText("Place Order").click();

  // Verify success message
  await expect(page.locator(".hero-primary")).toContainText(
    "Thankyou for the order"
  );

  // Capture order ID
  const orderIdRaw = await page
    .locator("td label.ng-star-inserted")
    .textContent();

  console.log("Raw Order ID:", orderIdRaw);

  const orderId = orderIdRaw
    ?.replaceAll("|", "")
    .trim();

  console.log("Parsed Order ID:", orderId);

  expect(orderId).toBeTruthy();

  // Navigate to My Orders
  await page.locator("label[routerlink='/dashboard/myorders']").click();

  // Wait for orders table
  await page.locator("tbody tr").first().waitFor();

  const rows = page.locator("tbody tr");
  const rowCount = await rows.count();

  let orderFound = false;

  for (let i = 0; i < rowCount; i++) {
    const rowOrderId = await rows.nth(i).locator("th").textContent();

    console.log("Table Order ID:", rowOrderId);

    if (rowOrderId?.trim() === orderId) {
      orderFound = true;

      await rows
        .nth(i)
        .getByRole("button", { name: "View" })
        .click();

      break;
    }
  }

  expect(orderFound).toBeTruthy();

  // Verify order details page opened
  await expect(page).toHaveURL(/order-details/);

  // Verify order id on details page
  await expect(page.locator(".col-text")).toContainText(orderId!);
});