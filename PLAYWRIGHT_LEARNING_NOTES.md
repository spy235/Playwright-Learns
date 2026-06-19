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

## API Testing & Network Interception

### Intercepting API Responses

**Concept**: Mock or monitor API calls without hitting real backend

```typescript
test("Intercept and mock API response", async ({ page }) => {
  // Mock API endpoint
  await page.route("**/api/users", route => {
    route.abort("blockedbyclient");
  });

  // Or return custom response
  await page.route("**/api/data", route => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: "mocked" }),
    });
  });

  await page.goto("https://example.com");
  // API calls are now intercepted
});
```

### Waiting for API Responses

```typescript
test("Wait for API response", async ({ page }) => {
  const responsePromise = page.waitForResponse("**/api/submit");
  
  await page.click("button"); // Triggers API call
  const response = await responsePromise;
  
  expect(response.ok()).toBeTruthy();
  const json = await response.json();
  expect(json.status).toBe("success");
});
```

### Modifying Request Headers

```typescript
test("Add authorization header to all requests", async ({ page }) => {
  await page.route("**/*", route => {
    route.continue({
      headers: {
        ...route.request().headers(),
        "Authorization": "Bearer my-token-123",
      },
    });
  });

  await page.goto("https://api.example.com/data");
});
```

---

## Storage State & Session Management

### Saving Browser State

**Concept**: Persist login session, cookies, localStorage across tests

```typescript
// Save state after login
test("Save authenticated session", async ({ page, context }) => {
  await page.goto("https://example.com/login");
  await page.fill("#email", "user@test.com");
  await page.fill("#password", "password123");
  await page.click("button[type='submit']");
  
  // Wait for navigation to confirm login
  await page.waitForURL("**/dashboard");
  
  // Save state to file
  await context.storageState({ path: "auth.json" });
});
```

### Reusing Saved State in Other Tests

```typescript
// Use saved state in other tests
test.use({ storageState: "auth.json" });

test("should show dashboard (already logged in)", async ({ page }) => {
  await page.goto("https://example.com");
  // Already authenticated - no login needed!
  await expect(page).toHaveURL("**/dashboard");
});
```

### Configuration Level Storage State

```typescript
// In playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: "authenticated",
      use: { 
        ...devices["Desktop Chrome"],
        storageState: "auth.json", // Auto-use this state
      },
    },
  ],
});
```

---

## File Upload & Download

### Uploading Files

**Concept**: Upload files programmatically without UI file picker

```typescript
test("Upload file", async ({ page }) => {
  await page.goto("https://example.com/upload");
  
  // Set file for upload
  await page.locator('input[type="file"]').setInputFiles("/path/to/file.txt");
  
  // Multiple files
  await page.locator('input[type="file"]').setInputFiles([
    "/path/file1.txt",
    "/path/file2.txt"
  ]);
  
  // Trigger upload
  await page.click("button[type='submit']");
});
```

### Downloading Files

```typescript
test("Download file", async ({ page }) => {
  const downloadPromise = page.waitForEvent("download");
  
  await page.click("a:has-text('Download')"); // Trigger download
  
  const download = await downloadPromise;
  
  // Save to specific location
  await download.saveAs("/path/to/save/file.pdf");
  
  // Get download info
  console.log(download.suggestedFilename());
  console.log(download.url());
});
```

---

## Mouse & Keyboard Actions

### Double Click

```typescript
test("Double click element", async ({ page }) => {
  await page.locator("#item").dblClick();
});
```

### Right Click (Context Menu)

```typescript
test("Right click element", async ({ page }) => {
  await page.locator("#item").click({ button: "right" });
  
  // Click context menu option
  await page.locator(".context-menu a").getByText("Delete").click();
});
```

### Drag and Drop

```typescript
test("Drag and drop element", async ({ page }) => {
  const source = page.locator("#draggable");
  const target = page.locator("#drop-zone");
  
  await source.dragTo(target);
});
```

### Keyboard Shortcuts

```typescript
test("Keyboard shortcuts", async ({ page }) => {
  // Single key
  await page.press("Enter");
  await page.press("Escape");
  await page.press("Delete");
  
  // Key combinations
  await page.press("Control+a");     // Select all
  await page.press("Control+c");     // Copy
  await page.press("Control+v");     // Paste
  await page.press("Shift+Tab");     // Shift + Tab
  
  // Type with modifier keys
  await page.keyboard.type("Hello", { delay: 100 }); // Type slowly
});
```

---

## Table Operations & Complex Selectors

### Reading Table Data

```typescript
test("Extract table data", async ({ page }) => {
  await page.goto("https://example.com/users");
  
  // Get all rows
  const rows = page.locator("table tbody tr");
  const rowCount = await rows.count();
  
  for (let i = 0; i < rowCount; i++) {
    const name = await rows.nth(i).locator("td:nth-child(1)").textContent();
    const email = await rows.nth(i).locator("td:nth-child(2)").textContent();
    const status = await rows.nth(i).locator("td:nth-child(3)").textContent();
    
    console.log(`${name} - ${email} - ${status}`);
  }
});
```

### Searching in Tables

```typescript
test("Find and click table row by content", async ({ page }) => {
  const rows = page.locator("table tbody tr");
  
  let found = false;
  const rowCount = await rows.count();
  
  for (let i = 0; i < rowCount; i++) {
    const name = await rows.nth(i).locator("td").first().textContent();
    
    if (name?.trim() === "John Doe") {
      // Click action button in this row
      await rows.nth(i).locator("button").click();
      found = true;
      break;
    }
  }
  
  expect(found).toBeTruthy();
});
```

### Using filter() for Cleaner Code

```typescript
test("Filter table rows more elegantly", async ({ page }) => {
  // Find row containing specific text and click it
  await page.locator("table tbody tr")
    .filter({ hasText: "John Doe" })
    .locator("button")
    .click();
});
```

---

## Screenshots & Visual Testing

### Taking Screenshots

```typescript
test("Take screenshot", async ({ page }) => {
  await page.goto("https://example.com");
  
  // Full page screenshot
  await page.screenshot({ path: "screenshot-full.png", fullPage: true });
  
  // Element screenshot
  await page.locator("#header").screenshot({ path: "screenshot-element.png" });
  
  // With omit boxes (useful for timestamps, IDs that change)
  await page.screenshot({
    path: "screenshot.png",
    mask: [page.locator("#dynamic-id"), page.locator("#timestamp")]
  });
});
```

### Visual Regression Testing

```typescript
test("Visual comparison", async ({ page }) => {
  await page.goto("https://example.com");
  
  // Compare with baseline
  expect(await page.screenshot()).toMatchSnapshot("homepage.png");
  
  // Update baseline if intentional changes made
  // npx playwright test --update-snapshots
});
```

---

## Advanced Assertions

### Custom Assertions

```typescript
test("Custom assertions", async ({ page }) => {
  const element = page.locator("button");
  
  // Soft assertions (test continues even if fails)
  expect.soft(element).toBeVisible();
  expect.soft(element).toBeEnabled();
  
  // These won't stop the test, but will be reported
  
  // Hard assertions (test stops on failure) - default behavior
  expect(element).toBeVisible();
});
```

### Combining Multiple Assertions

```typescript
test("Multiple assertions", async ({ page }) => {
  const input = page.locator("#email");
  
  await expect(input).toHaveAttribute("type", "email");
  await expect(input).toHaveAttribute("required");
  await expect(input).toHaveAttribute("placeholder", "Enter email");
});
```

### Timeout for Specific Assertions

```typescript
test("Custom assertion timeout", async ({ page }) => {
  // Wait up to 10 seconds for this element
  await expect(page.locator("#delayed-element")).toBeVisible({
    timeout: 10000
  });
});
```

---

## Environment & Configuration

### Using Environment Variables

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || "https://staging.example.com",
    trace: process.env.DEBUG ? "on" : "off",
  },
});

// In test file
test("use environment variables", async ({ page }) => {
  // baseURL is used automatically
  await page.goto("/dashboard");
  
  const apiToken = process.env.API_TOKEN;
  // Use token for API calls
});
```

### Running Tests with Environment Variables

```bash
# Command line
BASE_URL=https://production.example.com npx playwright test

# Or create .env file and use dotenv
npm install dotenv
```

---

## Retry Logic & Flakiness Management

### Built-in Retries

**Concept**: Automatically retry failed tests to handle flaky tests

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 3 : 0, // Retry 3 times in CI, 0 locally
});
```

### Fixing Flaky Tests with Retry Option

**Best Practice**: Use retries in config for flaky tests, but fix root cause

```typescript
// playwright.config.ts
export default defineConfig({
  retries: 2,
  timeout: 30 * 1000,
});

// Key Points:
// - Each retry re-runs entire test from scratch
// - Good for: timing issues, network delays
// - Not good for: persistent bugs that need fixing
// - Use retries as last resort, not primary solution
```

### Conditional Retries per Test

```typescript
// Retry only specific flaky tests
test.describe("Flaky tests", () => {
  test.describe.configure({ retries: 3 }); // Retry only these tests
  
  test("sometimes fails test", async ({ page }) => {
    // Will retry up to 3 times if fails
  });
});

test.describe("Reliable tests", () => {
  test.describe.configure({ retries: 0 }); // No retries
  
  test("always stable test", async ({ page }) => {
    // Won't retry even if global retries set
  });
});
```

### Mark Tests with fixme() and skip()

```typescript
test("mark test to skip", async ({ page }) => {
  test.skip(true, "Not implemented yet");
  // Test code won't run
});

test("mark test as fixme", async ({ page }) => {
  test.fixme(true, "Known issue - waiting for backend fix");
  // Test runs but failure is expected
});

// Conditionally skip/fixme
test("skip on Windows", async ({ page }) => {
  test.skip(process.platform === "win32", "Doesn't work on Windows");
});
```

### Debugging Flaky Tests

```typescript
test("capture trace for flaky test", async ({ page }) => {
  await page.context().tracing.start({ screenshots: true });
  
  // Test code
  
  // Only save trace on failure
  if (test.info().status !== "passed") {
    await page.context().tracing.stop({ 
      path: `trace-${test.info().title}.zip` 
    });
  }
});
```

---

## Serial vs Parallel Execution

### Understanding Parallel Execution (Default)

**Concept**: Multiple tests run simultaneously in separate worker processes

```typescript
// playwright.config.ts
export default defineConfig({
  workers: 4, // 4 tests run in parallel
  
  // In CI:
  workers: process.env.CI ? 1 : undefined, // Single worker for stability
});

// Running tests
npx playwright test                    // Uses all workers
npx playwright test --workers=2        // Override to 2 workers
npx playwright test --workers=1        // Force serial (1 worker)
```

### When to Use Parallel Execution

✅ **Use Parallel When:**
- Tests are independent (no shared state)
- Each test sets up its own data
- Tests use different test accounts
- Large test suite (saves time)

```typescript
test("independent test 1", async ({ page }) => {
  await page.goto("https://example.com");
  // Complete setup & assertions
});

test("independent test 2", async ({ page }) => {
  await page.goto("https://example.com");
  // Complete setup & assertions
});
```

### Understanding Serial Execution (Sequential)

**Concept**: Tests run one after another, waiting for each to complete

```typescript
// Run all tests sequentially
npx playwright test --workers=1

// OR in config:
export default defineConfig({
  workers: 1, // Force serial execution
});
```

### When to Use Serial Execution

⚠️ **Use Serial When:**
- Tests depend on each other
- Shared database/resource cleanup needed
- Race conditions with parallel execution
- Tests modify global state

```typescript
test.describe.configure({ mode: "serial" }); // Serial for this describe block

test("Step 1: Create user", async ({ page }) => {
  // Creates user in database
});

test("Step 2: Login user", async ({ page }) => {
  // Logs in the user created in Step 1
});

test("Step 3: Delete user", async ({ page }) => {
  // Deletes the user from Step 1
});
```

### Running Tests Parallelly from Same File

**Concept**: Run multiple instances of same test with different data

```typescript
// Default: tests in same file run in parallel
test("test 1", async ({ page }) => {
  await page.goto("https://example.com");
  // Independent operations
});

test("test 2", async ({ page }) => {
  await page.goto("https://example.com");
  // Independent operations - runs PARALLEL with test 1
});

test("test 3", async ({ page }) => {
  await page.goto("https://example.com");
  // Independent operations - runs PARALLEL with test 1 & 2
});

// Command line control
npx playwright test                    // Parallel (default)
npx playwright test --workers=1        // Force serial
npx playwright test --workers=4        // Increase parallelism
```

### External Control of Parallel Behavior

```bash
# Environment variable control
PLAYWRIGHT_WORKERS=2 npx playwright test

# Command line override
npx playwright test --workers=1        # Override config
npx playwright test --workers=4        # More parallel

# Project-specific parallelism
npx playwright test --project=chromium --workers=2
```

---

## Race Conditions & Fixes

### Understanding Race Conditions

**Concept**: Multiple tests competing for same resource causing unpredictable failures

```typescript
// ❌ BAD - Race condition example
test.describe("User Management", () => {
  // Shared state - causes race condition
  let userId;

  test("create user", async ({ page }) => {
    userId = await createUserInDB("john@test.com");
  });

  test("update user", async ({ page }) => {
    // Runs in parallel - userId might not be set yet!
    await updateUser(userId, { name: "Jane" });
  });

  test("delete user", async ({ page }) => {
    // Also runs in parallel - userId might not be set yet!
    await deleteUser(userId);
  });
});
```

### Fixing Race Conditions

**Solution 1: Use Serial Mode**

```typescript
test.describe.configure({ mode: "serial" }); // Tests run sequentially

test("step 1", async ({ page }) => {
  // Wait for this to complete before step 2
});

test("step 2", async ({ page }) => {
  // Now safe to use data from step 1
});
```

**Solution 2: Isolate Each Test**

```typescript
// ✅ GOOD - Each test is independent
test("create user", async ({ page }) => {
  const userId = await createUserInDB("john@test.com");
  await expect(userId).toBeTruthy();
});

test("update user", async ({ page }) => {
  const userId = await createUserInDB("jane@test.com");
  await updateUser(userId, { name: "Jane Doe" });
  await expect(userUpdated).toBeTruthy();
});

test("delete user", async ({ page }) => {
  const userId = await createUserInDB("bob@test.com");
  await deleteUser(userId);
  await expect(userDeleted).toBeTruthy();
});
```

**Solution 3: Use beforeAll for Setup**

```typescript
let sharedUserId;

test.describe("Shared Setup Tests", () => {
  test.beforeAll(async () => {
    // Runs ONCE before all tests in this describe
    sharedUserId = await createUserInDB("shared@test.com");
  });

  test("test 1", async ({ page }) => {
    // Can use sharedUserId - tests still parallel
    await loginAsUser(sharedUserId);
  });

  test("test 2", async ({ page }) => {
    // Can use sharedUserId
    await updateUser(sharedUserId);
  });

  test.afterAll(async () => {
    // Cleanup ONCE after all tests
    await deleteUser(sharedUserId);
  });
});
```

### Common Race Condition Scenarios

| Scenario | Problem | Solution |
|----------|---------|----------|
| Database record conflict | 2 tests try to create same user | Use unique data per test |
| Shared test account | Multiple tests login to same account | Create separate accounts |
| File system conflicts | 2 tests write to same file | Use unique filenames |
| API rate limits | Parallel calls exceed limits | Reduce workers or add delays |
| DOM race conditions | Elements appear/disappear unpredictably | Use proper waits & selectors |

---

## Tagging Tests & Controlling Execution

### Adding Tags to Tests

**Concept**: Mark tests with @tag for selective execution

```typescript
test("user can login @smoke @critical", async ({ page }) => {
  // This test has 2 tags: @smoke and @critical
  await page.fill("#email", "user@test.com");
  await page.fill("#password", "password123");
  await page.click("button");
});

test("user can logout @smoke", async ({ page }) => {
  // This test has 1 tag: @smoke
});

test("user can update profile @profile", async ({ page }) => {
  // This test has 1 tag: @profile
});

test("admin can delete users @admin", async ({ page }) => {
  // This test has 1 tag: @admin (not tagged as @smoke)
});
```

### Running Tests with Specific Tags

```bash
# Run only @smoke tests
npx playwright test --grep @smoke

# Run @critical tests only
npx playwright test --grep @critical

# Run tests with EITHER @smoke OR @critical
npx playwright test --grep "@smoke|@critical"

# Run all tests EXCEPT @admin
npx playwright test --grep "^(?!.*@admin)"

# Multiple conditions
npx playwright test --grep "@smoke.*@critical"  # Both tags
```

### Tag Organization Strategies

```typescript
// By severity/priority
test("feature works @critical", async ({ page }) => {});
test("edge case handled @minor", async ({ page }) => {});

// By category
test("login flows @auth", async ({ page }) => {});
test("payment processing @payment", async ({ page }) => {});

// By environment
test("works on staging @staging", async ({ page }) => {});
test("production only @prod", async ({ page }) => {});

// By owner/team
test("team-backend feature @team-backend", async ({ page }) => {});
test("team-frontend feature @team-frontend", async ({ page }) => {});

// Multiple tags
test("complete flow @e2e @smoke @critical", async ({ page }) => {});
```

### Tag-Based CI/CD Execution

```bash
# Local development - quick smoke tests
npx playwright test --grep @smoke

# Pre-deployment - all critical tests
npx playwright test --grep @critical

# Production - only @prod tests
npx playwright test --grep @prod

# Nightly run - everything except @skip
npx playwright test --grep "^(?!.*@skip)"

# Team-specific tests
npx playwright test --grep @team-backend
```

### Using Tags in Config & CI

```yaml
# .github/workflows/playwright.yml
name: Test Suite

on: [push]

jobs:
  smoke-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --grep @smoke

  full-tests:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test  # All tests
```

### Combining Tags with Serial/Parallel

```typescript
test.describe("Checkout Flow - @payment", () => {
  test.describe.configure({ mode: "serial" }); // Run sequentially
  
  test("add item to cart @smoke @payment", async ({ page }) => {});
  test("proceed to checkout @payment", async ({ page }) => {});
  test("complete payment @critical @payment", async ({ page }) => {});
  test("verify order created @payment", async ({ page }) => {});
});

test.describe("User Profile - @profile", () => {
  // These run in parallel (default)
  test("edit profile @profile", async ({ page }) => {});
  test("change password @profile @critical", async ({ page }) => {});
  test("upload avatar @profile", async ({ page }) => {});
});

// Run commands
npx playwright test --grep @payment --workers=1     // Sequential payment tests
npx playwright test --grep "@profile|@auth"         // Parallel profile & auth tests
```

---

## Test Data Management

### Using Fixtures for Data

```typescript
// fixtures.ts
export const test = base.extend({
  testData: {
    user: {
      email: "test@example.com",
      password: "SecurePassword123",
      name: "Test User",
    },
    products: [
      { id: 1, name: "Product A", price: 99.99 },
      { id: 2, name: "Product B", price: 149.99 },
    ],
  },
});

// In test
test("use fixture data", async ({ page, testData }) => {
  await page.fill("#email", testData.user.email);
  await page.fill("#password", testData.user.password);
});
```

### Data-Driven Tests

```typescript
test.describe("User Registration", () => {
  const users = [
    { email: "user1@test.com", password: "Pass1234" },
    { email: "user2@test.com", password: "Pass5678" },
    { email: "user3@test.com", password: "Pass9012" },
  ];

  users.forEach(user => {
    test(`register user ${user.email}`, async ({ page }) => {
      await page.goto("/register");
      await page.fill("#email", user.email);
      await page.fill("#password", user.password);
      await page.click("button");
      
      await expect(page).toHaveURL(/.*success/);
    });
  });
});
```

---

## Parallel Execution & Performance

### Understanding Worker Processes

```typescript
// playwright.config.ts
export default defineConfig({
  workers: 4, // Run 4 tests simultaneously
  
  // OR in CI environment
  workers: process.env.CI ? 1 : 4, // Single worker in CI for stability
});
```

### Organizing Tests for Parallel Execution

```typescript
// Tests run in parallel, so avoid:
// ❌ Shared state across tests
// ❌ Tests modifying same database records
// ❌ Tests that depend on execution order

// ✅ DO: Isolate tests
test.describe("Shopping", () => {
  test.beforeEach(async ({ page }) => {
    // Each test gets fresh setup
    await page.goto("/");
    await page.context().clearCookies();
  });

  test("add to cart", async ({ page }) => {
    // Independent test
  });

  test("remove from cart", async ({ page }) => {
    // Independent test
  });
});
```

---

## CI/CD Integration

### Running in GitHub Actions

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - run: npm ci
      - run: npx playwright install --with-deps
      
      - run: npx playwright test
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          API_TOKEN: ${{ secrets.API_TOKEN }}
      
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Running Specific Tests in CI

```bash
# Run only smoke tests
npx playwright test --grep @smoke

# Run specific project
npx playwright test --project=chromium

# Run single file
npx playwright test tests/login.spec.ts
```

---