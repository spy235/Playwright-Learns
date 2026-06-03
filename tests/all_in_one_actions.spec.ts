import test, { expect } from "@playwright/test";

test("Radio Buttons", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com/");

  // Select Female
  await page.locator("#female").check();
  await expect(page.locator("#female")).toBeChecked();

  // Select Male
  await page.locator("#male").check();

  // Verify Female is unchecked
  await expect(page.locator("#female")).not.toBeChecked();

  // Verify Male is checked
  await expect(page.locator("#male")).toBeChecked();
});

test("Check Boxs", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com/");

  let valuesToBeChecked = ["monday", "sunday"];
  const allCheckBoxs = page.locator(
    "div[class='form-group'] input[type='checkbox']",
  );
  const count = await allCheckBoxs.count();

  for (let i = 0; i < count; i++) {
    const checkbox = allCheckBoxs.nth(i);

    const value = await checkbox.getAttribute("value");

    if (value && valuesToBeChecked.includes(value)) {
      await checkbox.check();
    }
  }
});

test("Static DropDown", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com/");
  await page.locator("#country").selectOption("India");
  // Verify selected value
  await expect(page.locator("#country")).toHaveValue("india");
});

test("Multiple select options", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com/");
  //   await page.locator("#colors").selectOption("Green");
  //   await page.locator("#colors").selectOption("Blue");

  // in this No — with selectOption() you do not need to hold the Ctrl key manually.
  await page.locator("#colors").selectOption(["Green", "Blue"]);
});

test("Date Picker 1", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");
  let date = "05/15/2026";
  await page.locator("#datepicker").click();
  await page.locator("#datepicker").fill(date);
  expect(await page.locator("span.ui-datepicker-year").textContent()).toEqual(
    date.split("/")[2],
  );
});

test("Date Picker 2", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");
  await page.locator("#txtDate").click();
  await page.locator(".ui-datepicker-month").selectOption("Feb");
  await page.locator(".ui-datepicker-year").selectOption("2034");
  let count = await page
    .locator("#ui-datepicker-div tbody tr td[data-event='click']")
    .count();

  for (let i = 0; i < count; i++) {
    const day = await page
      .locator("#ui-datepicker-div tbody tr td[data-event='click']")
      .nth(i)
      .locator("a")
      .textContent();

    if (day && day === "23") {
      await page
        .locator("#ui-datepicker-div tbody tr td[data-event='click']")
        .nth(i)
        .click();
      break;
    }
  }
});

test("Child pop up Window Handling", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");

  const [newPage] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(".widget-content button").getByText("Popup Windows").click(),
  ]);

  const heading = await newPage.locator(".mx-auto h1").textContent();
  expect(heading).toContain("Selenium automates");
});

test("New Tab  Handling", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");

  const [newPage] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(".widget-content button").getByText("New Tab").click(),
  ]);

  const heading = await newPage.locator(".titlewrapper h1").textContent();
  expect(heading).toContain("SDET");
});

test("Alerts & Popups", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");
  page.on("dialog", async (dialog) => {
    console.log(dialog.message());
    await dialog.accept();
  });
  await page.locator("#alertBtn").click();

  //page.on('dialog') → set once, handles all dialogs
  //waitForEvent('dialog') → one-time handling per action
  await page.locator("#confirmBtn").click();
});

test("Alerts & Popups - single dailogs", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");

  const alert = await Promise.all([
    page.waitForEvent("dialog"),
    page.locator("#alertBtn").click(),
  ]);

  await alert[0].accept();

  const confirm = await Promise.all([
    page.waitForEvent("dialog"),
    page.locator("#confirmBtn").click(),
  ]);

  await confirm[0].accept(); // or dismiss()
});

test("Search Box Dynamic content", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");

  const searchBox = page.locator("#Wikipedia1_wikipedia-search-input");
  await searchBox.fill("Hello");

  await searchBox.press("Enter");
  const results = page.locator("#Wikipedia1_wikipedia-search-results a");

  await expect(results.first()).toBeVisible();
  const count = await results.count();

  for (let i = 0; i < count; i++) {
    console.log(await results.nth(i).textContent());
  }
});

test("Hover button", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");
  await page.locator("button.dropbtn").hover();
  await page.locator(".dropdown-content").waitFor({ state: "visible" });
  let count = await page.locator(".dropdown-content a").count();
  for (let i = 0; i < count; i++) {
    let hoverContent = await page
      .locator(".dropdown-content a")
      .nth(i)
      .textContent();
    if (hoverContent === "Mobiles") {
      await page.locator(".dropdown-content a").nth(i).click();
    }
  }
});

test("Double click", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");
  let value = await page.locator("#field1").inputValue();
  await page.getByText("Copy Text").dblclick();
  let value1 = await page.locator("#field2").inputValue();
  expect(value).toEqual(value1);
});

test("drag and drop element", async ({ page }) => {
  // open your page
  await page.goto("https://testautomationpractice.blogspot.com");

  // method 1: using dragTo()  (recommended)
  await page.locator("#draggable").dragTo(page.locator("#droppable"));

  // verify text changed after drop
  await expect(page.locator("#droppable p")).toHaveText("Dropped!");
});

test("scroll drop down element", async ({ page }) => {
  // open your page
  await page.goto("https://testautomationpractice.blogspot.com");
  await page.locator("#comboBox").click();
  await expect(page.locator("#dropdown")).toBeVisible();
  const numofproducts = await page
    .locator("#dropdown div[class='option'] ")
    .count();
  for (let i = 0; i < numofproducts; i++) {
    const value = await page
      .locator("#dropdown div[class='option'] ")
      .nth(i)
      .textContent();
    if (value == "Item 99") {
      await page.locator("#dropdown div[class='option'] ").nth(i).click();
      break;
    }
  }
  expect(await page.locator("#comboBox").inputValue()).toEqual("Item 99");
});

test("verify broken links", async ({ page, request }) => {
  await page.goto("https://testautomationpractice.blogspot.com");

  const links = page.locator("#broken-links a");

  await expect(links).toHaveCount(8);

  for (let i = 0; i < (await links.count()); i++) {
    const link = links.nth(i);

    const href = await link.getAttribute("href");

    // Assertion
    expect(href).not.toBeNull();

    // Type-safe check
    if (!href) continue;

    const response = await request.get(href);

    const status = response.status();

    console.log(`${href} -> ${status}`);

    expect(status).toBeGreaterThanOrEqual(400);
  }
});

test("verify single file upload", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");

  await page.locator("#singleFileInput").setInputFiles("C:/Users/YashasJ/Downloads/Executive_Summary_1128_1779354360.pdf");

  await page.locator("#singleFileForm button").click();
   expect(await page.locator("#singleFileStatus").textContent()).toContain("Executive_Summary_1128_1779354360")
});


test("table operations", async ({ page }) => {
   await page.goto("https://testautomationpractice.blogspot.com");

  let row_count = await page.locator("table[name='BookTable'] tr").count();
  for (let i = 1; i < row_count; i++) {
    let price =
      await page
        .locator("table[name='BookTable'] tr")
        .nth(i)
        .locator("td:nth-child(4)")
        .textContent();
    if (parseInt(price || "0") > 1000) {
      let bookName =
        await page
          .locator("table[name='BookTable'] tr")
          .nth(i)
          .locator("td:nth-child(1)")
          .textContent();
      console.log(bookName);
    }
  }
});

test("getBys",async({page})=>{
  
// 🔵 getByRole()
// where we can use: buttons, inputs, headings (best semantic locators)
await page.getByRole('button', { name: 'Login' }).click();

/*
<html>
  <button>Login</button>
</html>
*/


// 🟢 getByText()
// where we can use: visible text anywhere on page
await page.getByText('Login Successful');

/*
<html>
  <div>Login Successful</div>
</html>
*/


// 🟡 getByPlaceholder()
// where we can use: input fields with placeholder text
await page.getByPlaceholder('Select Country').fill('Afg');

/*
<html>
  <input placeholder="Select Country" />
</html>
*/


// 🟣 getByLabel()
// where we can use: form fields linked with label
await page.getByLabel('Email').fill('test@gmail.com');

/*
<html>
  <label>Email</label>
  <input type="text" />
</html>
*/


// 🔴 getByTestId()
// where we can use: automation-friendly attributes (BEST PRACTICE)
await page.getByTestId('cart-count').textContent();

/*
<html>
  <div data-testid="cart-count">2</div>
</html>
*/


// 🟠 getByTitle()
// where we can use: tooltip/title attribute
await page.getByTitle('Shopping Cart').click();

/*
<html>
  <span title="Shopping Cart">🛒</span>
</html>
*/


// 🟤 getByAltText()
// where we can use: images (alt attribute)
await page.getByAltText('ZARA COAT 3');

/*
<html>
  <img src="product.jpg" alt="ZARA COAT 3" />
</html>
*/
})