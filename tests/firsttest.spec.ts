import { test, expect } from '@playwright/test';

// npx playwright test --ui  Para ejecutar el test en modo interactivo para verlo en el navegador



// Hooks Precondiciones 
test.beforeEach(async ({ page }) => {
    await page.goto('https://www.the-badgers.com/');
});
// Single test example
// Page en la primer linea llama a la pagina 
// En la segunda linea page.(loque sea) ejecuta coasas en la pagina 
test('first test',  async ({ page }) => {
    await page.goto('https://www.the-badgers.com/');
 
 });

// Test suite example  - Puede tener múltiples tests y pre-condiciones
test.describe('Pagina principal', () => {
    test('test 1', async ({ page }) => {
        await page.goto('https://playwright.dev/');
        const title = await page.title();
        expect(title).toContain('Playwright');
    });

    test('test 2', async ({ page }) => {
        await page.goto('https://playwright.dev/');
        const title = await page.title();
        expect(title).toContain('Playwright');
    });

    test('test 3', async ({ page }) => {
        await page.goto('https://playwright.dev/');
        const title = await page.title();
        expect(title).toContain('Playwright');
    });
});


// Locators

test('by tag name', async ({ page }) => {
   // By tag
    page.locator('a').first().click();
   // By id 
   page.locator('#nav-menu-item-100').click(); 
   // By class
   page.locator('.nav-menu-item').first().click();
   // By attribute
   page.locator('[text=Inicio]').click();
   // Combinar varios selectores
   page.locator('a[href="/"]').click();
   // Partial text
   page.locator(':text("Inicio")').click();
});
 