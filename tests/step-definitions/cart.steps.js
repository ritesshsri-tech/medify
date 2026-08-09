const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('playwright/test');

When('I add a medicine to the cart', async function () {
  await this.gotoPage('pages/category.html');
  await this.page.waitForSelector('#medicineGrid > div');
  const card = this.page.locator('#medicineGrid > div').first();
  this.addedMedicineName = await card.locator('h3').innerText();
  await card.locator('button:has-text("Add")').click();
});

Then('localStorage.cart contains one entry for that medicine with qty {int}', async function (qty) {
  const cart = await this.page.evaluate(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  expect(cart).toHaveLength(1);
  expect(cart[0].qty).toBe(qty);
});

Then('the header cart badge shows {string}', async function (count) {
  await expect(this.page.locator('#headerCartBadge')).toHaveText(count);
});

When('I add that same medicine to the cart again', async function () {
  const card = this.page.locator(`#medicineGrid > div:has-text("${this.testMedicineCardName}")`).first();
  await card.locator('button:has-text("Add")').click();
});

Then('no duplicate entry is created', async function () {
  const cart = await this.page.evaluate(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const ids = cart.map((i) => i.id);
  expect(new Set(ids).size).toBe(ids.length);
});

Then('the header cart badge is not shown', async function () {
  await this.gotoPage('pages/category.html');
  await expect(this.page.locator('#headerCartBadge')).toBeHidden();
});

When('I remove one medicine from the cart', async function () {
  await this.page.evaluate(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.pop();
    localStorage.setItem('cart', JSON.stringify(cart));
  });
});

Then('localStorage.cart contains only the remaining medicine', async function () {
  const cart = await this.page.evaluate(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  expect(cart).toHaveLength(1);
});

Then('the header cart badge reflects the remaining quantity', async function () {
  await this.page.reload();
  await this.page.waitForSelector('#medicineGrid > div');
  const cart = await this.page.evaluate(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const expectedCount = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
  await expect(this.page.locator('#headerCartBadge')).toHaveText(String(expectedCount));
});

Then('localStorage.cart still contains that medicine with qty {int}', async function (qty) {
  const cart = await this.page.evaluate(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  expect(cart[0].qty).toBe(qty);
});
