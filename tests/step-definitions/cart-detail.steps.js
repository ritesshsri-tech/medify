const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('playwright/test');

async function openKnownMedicine(page, gotoPage) {
  const meds = await page.evaluate(async () => {
    const res = await fetch('../data/medicines.json');
    return res.json();
  });
  const med = meds.find((m) => m.status === 'published');
  await gotoPage(`pages/medicine-detail.html?id=${med.id}`);
  await page.waitForSelector('#allSections:not(.hidden)', { timeout: 10000 });
}

Given('I open the detail page for a known medicine at desktop width', async function () {
  await this.setViewport(1400, 900);
  await openKnownMedicine(this.page, this.gotoPage.bind(this));
});

Given('I open the detail page for a known medicine at mobile width', async function () {
  await this.setViewport(375, 800);
  await openKnownMedicine(this.page, this.gotoPage.bind(this));
});

When('I increase the quantity via the desktop control', async function () {
  await this.page.locator('.border-blue-200.rounded-full button[onclick="window.changeQty(1)"]').first().click();
});

When('I increase the quantity via the mobile control', async function () {
  await this.page.locator('#mobCartBar button[onclick="window.changeQty(1)"]').click();
});

When('I decrease the quantity via the desktop control', async function () {
  await this.page.locator('.border-blue-200.rounded-full button[onclick="window.changeQty(-1)"]').first().click();
});

When('I switch to mobile width', async function () {
  await this.setViewport(375, 800);
});

When('I switch to desktop width', async function () {
  await this.setViewport(1400, 900);
});

Then('the mobile quantity display shows {int}', async function (qty) {
  await expect(this.page.locator('#mobQtyDisplay')).toHaveText(String(qty));
});

Then('the desktop quantity display shows {int}', async function (qty) {
  await expect(this.page.locator('#qtyDisplay')).toHaveText(String(qty));
});
