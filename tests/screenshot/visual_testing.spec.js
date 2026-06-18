import { test, expect } from '@playwright/test';

test('Visual Testing Demo', async ({ page }) => {

    // Navigate to the application
    await page.goto('https://rahulshettyacademy.com/client');

    // Wait until the page is completely loaded
    await page.waitForLoadState('networkidle');

    // =====================================================
    // 1. Capture a full page screenshot
    // =====================================================

    await page.screenshot({
        path: 'screenshots/fullPage.png', // Location to save screenshot
        fullPage: true                    // Capture entire page
    });

    console.log('Full page screenshot captured');

    // =====================================================
    // 2. Capture screenshot of a specific element
    // =====================================================

    const header = page.locator('.navbar');

    await header.screenshot({
        path: 'screenshots/navbar.png'
    });

    console.log('Navbar screenshot captured');

    // =====================================================
    // 3. Visual comparison of entire page
    // =====================================================
    // First execution:
    //   Creates baseline image
    //
    // Next executions:
    //   Compares current image against baseline
    //   Fails test if differences are detected
    // =====================================================

    await expect(page).toHaveScreenshot('homepage-baseline.png');

    console.log('Full page visual validation completed');

    // =====================================================
    // 4. Visual comparison of a specific element
    // =====================================================

    await expect(header).toHaveScreenshot('navbar-baseline.png');

    console.log('Element visual validation completed');

});

//npx playwright test --update-snapshots
