# Playwright 2.0 - Learning Notes & Revision Guide

> A comprehensive reference for Playwright test automation concepts learned from this repository  
> **Updated: June 2026** - Latest Playwright practices and features

---

## Table of Contents
1. [Setup & Configuration](#setup--configuration)
2. [Locators & Selectors](#locators--selectors)
3. [Form Interactions](#form-interactions)
4. [Date Pickers](#date-pickers)
5. [Window & Tab Handling](#window--tab-handling)
6. [Alerts & Popups](#alerts--popups)
7. [Dynamic Content](#dynamic-content)
8. [Advanced Actions](#advanced-actions)
9. [Best Practices & Tips](#best-practices--tips)
10. [Quick Reference Cheat Sheet](#quick-reference-cheat-sheet)

---

## Setup & Configuration

### Project Dependencies
```json
{
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "@types/node": "^22.0.0"
  }
}
```

### Configuration File (`playwright.config.ts`)
```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,           // Run tests in parallel
  forbidOnly: !!process.env.CI,  // Forbid .only in CI
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  timeout: 30 * 1000,            // 30 second timeout per test
  expect: {
    timeout: 5 * 1000,           // 5 second timeout for assertions
  },
  
  reporter: [
    ["html"],                    // Generate HTML report
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],
  
  use: {
    headless: true,              // Run headless in CI
    trace: "on-first-retry",     // Collect trace on first retry
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  
  webServer: {
    command: "npm run start", // optional: start local server
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### Running Tests
```bash
# Run all tests
npx playwright test

# Run tests with UI mode (visual debugging)
npx playwright test --ui

# Run specific test file
npx playwright test tests/all_in_one_actions.spec.ts

# Run tests matching pattern
npx playwright test --grep @smoke

# Run tests in specific browser
npx playwright test --project=chromium

# Debug mode (inspector)
npx playwright test --debug

# Generate and show HTML report
npx playwright show-report

# Run tests headed (see browser)
npx playwright test --headed
```

### Modern Test Structure
```typescript
import { test, expect } from "@playwright/test";

test.describe("Login Tests", () => {
  let page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto("https://example.com");
  });

  test("should login successfully", async () => {
    await page.fill("#email", "user@example.com");
    await page.fill("#password", "password123");
    await page.click("button[type='submit']");
    
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test.afterEach(async () => {
    // Cleanup if needed
  });
});
```

---

## Locators & Selectors

### Finding Elements

#### By ID
```typescript
page.locator("#elementId")
```

#### By CSS Class
```typescript
page.locator(".className")
page.locator("div[class='form-group']")
```

#### By Attribute
```typescript
page.locator("input[type='checkbox']")
page.locator("button.dropbtn")
```

#### Combined Selectors
```typescript
page.locator("div[class='form-group'] input[type='checkbox']")
```

#### By Text
```typescript
page.locator(".widget-content button").getByText("Popup Windows")
page.locator(".dropdown-content a").getByText("Mobiles")
```

#### By XPath (Advanced)
```typescript
page.locator("#ui-datepicker-div tbody tr td[data-event='click']")
```

### Locator Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `.count()` | Get number of matching elements | `await locator.count()` |
| `.nth(i)` | Get element at index i | `locator.nth(0)` |
| `.first()` | Get first matching element | `locator.first()` |
| `.textContent()` | Get text inside element | `await locator.textContent()` |
| `.getAttribute()` | Get HTML attribute | `await locator.getAttribute("value")` |
| `.click()` | Click element | `await locator.click()` |
| `.fill()` | Fill input with text | `await locator.fill("text")` |
| `.check()` | Check checkbox/radio | `await locator.check()` |
| `.hover()` | Hover over element | `await locator.hover()` |

---

## Form Interactions

### Radio Buttons

**Concept**: Only one radio button can be selected at a time in a group

```typescript
test("Radio Buttons", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com/");

  // Select Female
  await page.locator("#female").check();
  await expect(page.locator("#female")).toBeChecked();

  // Select Male - automatically unchecks Female
  await page.locator("#male").check();

  // Verify Female is now unchecked
  await expect(page.locator("#female")).not.toBeChecked();
  await expect(page.locator("#male")).toBeChecked();
});
```

**Key Points**:
- Use `.check()` to select a radio button
- Use `.toBeChecked()` to assert it's selected
- Use `not.toBeChecked()` to assert it's not selected
- Only one can be checked in a group

---

### Checkboxes

**Concept**: Multiple checkboxes can be selected independently

```typescript
test("Check Boxes", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com/");

  let valuesToBeChecked = ["monday", "sunday"];
  const allCheckBoxs = page.locator(
    "div[class='form-group'] input[type='checkbox']"
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
```

**Key Points**:
- Use `.count()` to get total number of checkboxes
- Use `.nth(i)` to access specific checkbox
- Use `.getAttribute()` to get checkbox value
- Use `.check()` to select checkboxes
- Multiple checkboxes can be checked simultaneously

---

### Static Dropdown

**Concept**: Pre-defined list of options

```typescript
test("Static DropDown", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com/");
  
  // Select by visible text
  await page.locator("#country").selectOption("India");
  
  // Verify selected value
  await expect(page.locator("#country")).toHaveValue("india");
});
```

**Key Points**:
- Use `.selectOption()` to select dropdown option
- Select by label text or value
- Use `.toHaveValue()` to verify selection

---

### Multiple Select Dropdown

**Concept**: Allow selecting multiple options at once

```typescript
test("Multiple select options", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com/");

  // Pass array to select multiple options
  await page.locator("#colors").selectOption(["Green", "Blue"]);
});
```

**Key Points**:
- Pass array of values to `.selectOption()`
- No need to hold Ctrl key manually (Playwright handles it)
- Both options will be selected

---

## Date Pickers

### Date Picker Type 1: Direct Input

**Concept**: Fill date directly into input field

```typescript
test("Date Picker 1", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");
  
  let date = "05/15/2026";
  await page.locator("#datepicker").click();
  await page.locator("#datepicker").fill(date);
  
  expect(await page.locator("span.ui-datepicker-year").textContent()).toEqual(
    date.split("/")[2]
  );
});
```

**Key Points**:
- Click the date input to open picker
- Use `.fill()` to enter date string
- Verify year matches using `.textContent()`
- Format: MM/DD/YYYY

---

### Date Picker Type 2: Calendar Widget

**Concept**: Select date from calendar UI with month/year dropdowns

```typescript
test("Date Picker 2", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");
  
  // Click to open calendar
  await page.locator("#txtDate").click();
  
  // Select month and year
  await page.locator(".ui-datepicker-month").selectOption("Feb");
  await page.locator(".ui-datepicker-year").selectOption("2034");
  
  // Find and click specific day
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
```

**Key Points**:
- Use dropdown selection for month and year
- Iterate through calendar cells to find day
- Use nested locators with `.locator("a")`
- Extract text content to compare day number
- Break loop once day is found and clicked

---

## Window & Tab Handling

### Opening New Popup Window

**Concept**: Handle new browser window/popup

```typescript
test("Child pop up Window Handling", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");

  const [newPage] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(".widget-content button").getByText("Popup Windows").click(),
  ]);

  const heading = await newPage.locator(".mx-auto h1").textContent();
  expect(heading).toContain("Selenium automates");
});
```

**Key Points**:
- Use `Promise.all()` to wait for popup AND trigger action simultaneously
- `page.waitForEvent("popup")` listens for new window
- Returns array with `[newPage]` - destructure to get new page object
- Use `newPage` locator same as main `page`
- Can interact with popup like any page

---

### Opening New Tab

**Concept**: Handle new tab (similar to popup)

```typescript
test("New Tab Handling", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");

  const [newPage] = await Promise.all([
    page.waitForEvent("popup"),
    page.locator(".widget-content button").getByText("New Tab").click(),
  ]);

  const heading = await newPage.locator(".titlewrapper h1").textContent();
  expect(heading).toContain("SDET");
});
```

**Key Points**:
- Popup event handles both popup windows and new tabs
- Same pattern as popup handling
- Extract text and verify content in new tab

---

## Alerts & Popups

### Method 1: Event Listener (Multiple Dialogs)

**Concept**: Handle all dialogs that appear during test with single handler

```typescript
test("Alerts & Popups", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");
  
  // Set listener once - handles all dialogs
  page.on("dialog", async (dialog) => {
    console.log(dialog.message());
    await dialog.accept();
  });
  
  await page.locator("#alertBtn").click();
  await page.locator("#confirmBtn").click();
});
```

**Key Points**:
- Use `page.on("dialog", ...)` to set persistent listener
- Set ONCE - handles all dialogs that appear
- Use `dialog.accept()` to click OK
- Use `dialog.dismiss()` to click Cancel
- Get message with `dialog.message()`

---

### Method 2: Wait for Event (Single Dialog)

**Concept**: Wait for specific dialog and handle it individually

```typescript
test("Alerts & Popups - single dialogs", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");

  // First dialog
  const alert = await Promise.all([
    page.waitForEvent("dialog"),
    page.locator("#alertBtn").click(),
  ]);
  await alert[0].accept();

  // Second dialog
  const confirm = await Promise.all([
    page.waitForEvent("dialog"),
    page.locator("#confirmBtn").click(),
  ]);
  await confirm[0].accept(); // or dismiss()
});
```

**Key Points**:
- Use `page.waitForEvent("dialog")` for one-time handling
- Must use before action that triggers dialog
- Returns array - access dialog with `[0]`
- Use `accept()` or `dismiss()` to handle
- Repeat for each dialog in test

---

### When to Use Which Method?

| Scenario | Method | Why |
|----------|--------|-----|
| Multiple dialogs in sequence | `page.on()` | Set once, handles all |
| Single/few specific dialogs | `waitForEvent()` | More control per dialog |
| Need to read message per dialog | `waitForEvent()` | Can access each separately |
| Simple accept all | `page.on()` | Cleaner code |

---

## Dynamic Content

### Searching & Filtering Dynamic Results

**Concept**: Search for content that loads dynamically

```typescript
test("Search Box Dynamic content", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");

  const searchBox = page.locator("#Wikipedia1_wikipedia-search-input");
  await searchBox.fill("Hello");
  await searchBox.press("Enter");
  
  const results = page.locator("#Wikipedia1_wikipedia-search-results a");

  // Wait for at least one result to be visible
  await expect(results.first()).toBeVisible();
  
  // Count all results
  const count = await results.count();

  // Iterate and log each result
  for (let i = 0; i < count; i++) {
    console.log(await results.nth(i).textContent());
  }
});
```

**Key Points**:
- Use `.fill()` to enter search text
- Use `.press("Enter")` to submit search
- Wait for results with `.toBeVisible()`
- Use `.count()` to get number of results
- Use `.nth(i)` to iterate through results
- Use `.textContent()` to get result text

---

### Waiting Strategies

| Method | Use When |
|--------|----------|
| `.toBeVisible()` | Element should appear after action |
| `.first()` | Want to interact with first element |
| `.waitFor({ state: "visible" })` | Need to explicitly wait |
| `.count()` | Need to know how many elements exist |

---

## Advanced Actions

### Hover Actions

**Concept**: Hover over element to reveal dropdown/menu

```typescript
test("Hover button", async ({ page }) => {
  await page.goto("https://testautomationpractice.blogspot.com");
  
  // Hover to reveal dropdown
  await page.locator("button.dropbtn").hover();
  
  // Wait for dropdown to be visible
  await page.locator(".dropdown-content").waitFor({ state: "visible" });
  
  // Find and click specific item
  let count = await page.locator(".dropdown-content a").count();
  
  for (let i = 0; i < count; i++) {
    let hoverContent = await page.locator(".dropdown-content a").nth(i).textContent();
    
    if (hoverContent === "Mobiles") {
      await page.locator(".dropdown-content a").nth(i).click();
    }
  }
});
```

---

## Best Practices & Tips

### 1. Use Modern Locator Strategies
```typescript
// ✅ GOOD - Built-in methods (more reliable)
page.getByRole("button", { name: "Submit" });
page.getByLabel("Email");
page.getByPlaceholder("Enter email");
page.getByText("Welcome");

// ⚠️ AVOID - CSS/XPath (brittle, maintenance heavy)
page.locator("div.btn-submit");
page.locator("//button[@class='submit']");
```

### 2. Explicit Waits (Recommended)
```typescript
// ✅ GOOD - Wait for specific element state
await page.locator("#result").waitFor({ state: "visible" });
await expect(page.locator(".success")).toBeVisible();

// ⚠️ AVOID - Hard sleeps
await page.waitForTimeout(5000); // Don't do this!
```

### 3. Use Test Fixtures for Setup
```typescript
// ✅ GOOD - Reusable fixtures
test.beforeEach(async ({ page }) => {
  await page.goto("https://example.com");
  await page.fill("#login", "user");
  await page.fill("#password", "pass");
  await page.click("button");
});

test("should perform action", async ({ page }) => {
  // Already logged in
  await page.click("#action-btn");
});
```

### 4. Error Handling & Debugging
```typescript
// Use trace for debugging failures
test("my test", async ({ page }) => {
  await page.context().tracing.start({ screenshots: true, snapshots: true });
  
  // Test code here
  
  await page.context().tracing.stop({ path: "trace.zip" });
});

// Use videos for visual debugging
// Configured in playwright.config.ts
```

### 5. Network & Response Handling
```typescript
// ✅ Mock API responses
await page.route("**/api/users**", route => {
  route.abort("blockedbyclient");
});

// ✅ Wait for network response
const responsePromise = page.waitForResponse("**/api/data**");
await page.click("button");
const response = await responsePromise;
expect(response.ok()).toBeTruthy();

// ✅ Intercept and modify requests
await page.route("**/api/**", route => {
  const request = route.request();
  route.continue({
    headers: {
      ...request.headers(),
      "Authorization": "Bearer token",
    },
  });
});
```

### 6. Accessibility Testing
```typescript
// ✅ Use role-based locators (accessible + stable)
page.getByRole("button", { name: "Login" });
page.getByRole("textbox", { name: "Username" });

// ✅ Check accessibility
const accessibilityScan = await page.locator("main").evaluate(
  el => new (window as any).AxeCore(el).run()
);
```

### 7. Test Organization
```typescript
// ✅ Group related tests
test.describe("Shopping Cart", () => {
  test("should add item to cart", async ({ page }) => {
    // Test code
  });

  test("should remove item from cart", async ({ page }) => {
    // Test code
  });

  test.describe("Checkout", () => {
    test("should complete purchase", async ({ page }) => {
      // Test code
    });
  });
});

// ✅ Tag tests for selective runs
test("should login @smoke @critical", async ({ page }) => {
  // Then run: npx playwright test --grep @smoke
});
```

### 8. Performance Optimization
```typescript
// ✅ Run tests in parallel (default)
// ✅ Use browserContext for isolation
const context = await browser.newContext();
const page = await context.newPage();

// ✅ Reuse browser session when possible
test.use({
  navigationTimeout: 30000,
  actionTimeout: 10000,
});
```

---

## Quick Reference Cheat Sheet

### Common Commands
```bash
# Install
npm install -D @playwright/test

# Run all tests
npx playwright test

# UI Mode (recommended for development)
npx playwright test --ui

# Debug
npx playwright test --debug

# List tests
npx playwright test --list

# View report
npx playwright show-report
```

### Essential Locator Methods
```typescript
// Finding elements
page.locator("selector")                         // CSS/XPath
page.getByRole("button")                         // By ARIA role
page.getByLabel("label text")                    // By label
page.getByPlaceholder("placeholder")             // By placeholder
page.getByText("text")                           // By text content

// Filtering & Navigation
.first()                                         // First element
.last()                                          // Last element
.nth(0)                                          // Element at index
.filter({ hasText: "text" })                     // Filter by content

// Actions
.click()                                         // Click element
.fill("text")                                    // Fill input
.type("text")                                    // Type gradually
.press("Enter")                                  // Press key
.check()                                         // Check checkbox/radio
.uncheck()                                       // Uncheck
.selectOption("value")                           // Select dropdown
.hover()                                         // Hover over element
.focus()                                         // Focus element
.blur()                                          // Remove focus
.clear()                                         // Clear input

// Assertions
.toBeVisible()                                   // Element visible
.toBeHidden()                                    // Element hidden
.toBeEnabled()                                   // Element enabled
.toBeDisabled()                                  // Element disabled
.toBeChecked()                                   // Checkbox checked
.toHaveText("text")                              // Element has text
.toHaveValue("value")                            // Input has value
.toHaveAttribute("attr", "value")                // Has attribute
.toContainText("text")                           // Contains text
.toHaveURL("url")                                // Page URL matches
.toHaveCount(5)                                  // Element count

// Waiting
.waitFor({ state: "visible" })                   // Wait for state
.waitFor({ timeout: 5000 })                      // Custom timeout

// Properties
.textContent()                                   // Get text
.getAttribute("attr")                            // Get attribute
.inputValue()                                    // Get input value
.count()                                         // Count elements
```

### Fixture Examples
```typescript
// Use built-in fixtures
test("my test", async ({ page, context, browser }) => {
  // page - single browser page
  // context - isolated browser context
  // browser - browser instance
});

// Create custom fixture
const test = base.extend({
  loginPage: async ({ page }, use) => {
    await page.goto("/");
    await page.fill("#email", "user@test.com");
    await page.fill("#password", "password");
    await page.click("button");
    await use(page);
  },
});

test("should perform action", async ({ loginPage }) => {
  // Already logged in
  await loginPage.click("#action");
});
```

### Configuration Essentials
```typescript
// playwright.config.ts
{
  testDir: "./tests",              // Test directory
  testMatch: "**/*.spec.ts",        // Test file pattern
  timeout: 30000,                   // Global timeout (ms)
  workers: 4,                       // Parallel workers
  retries: 2,                       // Retry failed tests
  reporter: "html",                 // HTML report
  use: {
    headless: true,                 // Run headless
    screenshot: "only-on-failure",  // Screenshot on fail
    video: "retain-on-failure",     // Video on fail
    trace: "on-first-retry",        // Trace on retry
  },
}
```

### Key Differences from Selenium
```typescript
// Playwright is faster & more reliable
// - Auto-wait for elements
// - Network interception built-in
// - Cross-browser (Chromium, Firefox, WebKit)
// - Better DevTools integration
// - Modern async/await API
// - Built-in recording & tracing

// No need for:
// - WebDriverWait
// - Sleep statements
// - Thread.sleep()
// - Complex waits
```

---

## Debugging & Troubleshooting

### Common Issues & Solutions

**Issue: "Timeout waiting for selector"**
```typescript
// Solution: Use more reliable locators
page.getByRole("button", { name: "Click me" })  // Better than .btn-class

// Or increase timeout
test("test name", async ({ page }) => {
  page.setDefaultTimeout(60000);
  // Your test
});
```

**Issue: "Element not interactable"**
```typescript
// Solution: Ensure element is visible & enabled first
await page.locator("button").waitFor({ state: "visible" });
await page.locator("button").click();

// Or scroll into view if needed
await page.locator("button").scrollIntoViewIfNeeded();
```

**Issue: "Flaky/intermittent test failures"**
```typescript
// Solution: Use proper waits
// ✅ GOOD
await expect(page.locator(".success")).toBeVisible();

// ❌ BAD
await page.waitForTimeout(2000);
await page.locator(".success").click();
```

### Debugging Tools
```bash
# Debug mode with inspector
npx playwright test --debug

# UI Mode (visual debugging - highly recommended)
npx playwright test --ui

# Check what locators work
npx playwright codegen https://example.com  # Record actions

# View test traces
npx playwright show-trace trace.zip
```

---