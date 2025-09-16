import { test, expect } from '@playwright/test';

// Hooks
test.beforeEach(async ({ page }) => {
    await page.goto('https://www.the-badgers.com/');
});





// Navegar a todas las paginas
test('navegar por la nav bar', ({ page }) => {
   page.locator(':text("Inicio")').click();
   page.locator(':text("Sobre Nosotros")').click();
   page.locator(':text("Clases")').click();
   page.locator(':text("Galería")').click();
   page.locator(':text("Contacto")').click();
}); 

