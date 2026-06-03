# Playwright 2.0 - Learning Notes & Revision Guide

> A comprehensive reference for Playwright test automation concepts learned from this repository

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
    "@playwright/test": "^1.60.0",
    "@types/node": "^25.9.1"
  }
}
```

### Configuration File (`playwright.config.ts`)
```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30 * 1000,           // 30 second timeout per test
  expect: {
    timeout: 30 * 10000,        // 30 second timeout for assertions
  },
  reporter: "html",             // Generate HTML report
  use: {
    browserName: "webkit",      // Browser to use
    headless: false,            // Show browser window
  },
});
```

### Running Tests
```bash
# Run tests with UI
npx playwright test --ui

# Run specific test file
npx playwright test tests/all_in_one_actions.spec.ts

# Generate HTML report
npx playwright show-report
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

**Key Points**:
- Use `.hover()` to trigger hover state
- Use `.waitFor({ state: "visible" })` to wait for dropdown
- Iterate through dropdown items to find target
- Click specific item when found

---