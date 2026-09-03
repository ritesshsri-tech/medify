const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('playwright/test');

Given('I am logged in', async function () {
  await this.page.goto(`${this.baseUrl}/pages/login.html`);
  await this.page.evaluate(() => {
    // siteUnlocked is the PIN access boundary and is separate from persona
    // identity; without it every page bounces back to login.html.
    localStorage.setItem('siteUnlocked', '1');
    localStorage.setItem('currentUser', JSON.stringify({ name: 'Test User', email: 'test@example.com' }));
  });
});

Given('I am on the category page', async function () {
  await this.gotoPage('pages/category.html');
  await this.page.waitForSelector('#medicineGrid > div', { timeout: 10000 });
});

Given('the cart is empty', async function () {
  await this.page.evaluate(() => localStorage.removeItem('cart'));
});

Given('the cart already contains 1 of a medicine', async function () {
  if (!this.page.url().includes('category.html')) {
    await this.gotoPage('pages/category.html');
    await this.page.waitForSelector('#medicineGrid > div', { timeout: 10000 });
  }
  const firstCard = this.page.locator('#medicineGrid > div').first();
  await firstCard.locator('button:has-text("Add")').click();
  this.testMedicineCardName = await firstCard.locator('h3').innerText();
});

Given('the cart contains 1 medicine with qty 3', async function () {
  await this.page.evaluate(() => {
    localStorage.setItem('cart', JSON.stringify([{ id: 'med_00001', brandName: 'Test Med', price: 10000, qty: 3 }]));
  });
});

Given('the cart contains 2 distinct medicines', async function () {
  await this.page.evaluate(() => {
    localStorage.setItem(
      'cart',
      JSON.stringify([
        { id: 'med_00001', brandName: 'Med A', price: 10000, qty: 1 },
        { id: 'med_00002', brandName: 'Med B', price: 20000, qty: 1 },
      ])
    );
  });
});

Then('no error is thrown to the console', function () {
  expect(this.consoleErrors, `Console errors: ${this.consoleErrors.join(', ')}`).toHaveLength(0);
});

When('I reload the page', async function () {
  await this.page.reload();
});
