const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('playwright/test');

async function allMedicines(page) {
  return page.evaluate(async () => {
    const res = await fetch('../data/medicines.json');
    return res.json();
  });
}

async function findMedicineWithSameSaltAlt(page) {
  const meds = await allMedicines(page);
  const published = meds.filter((m) => m.status === 'published');
  const counts = {};
  published.forEach((m) => {
    counts[m.saltName] = (counts[m.saltName] || 0) + 1;
  });
  return published.find((m) => counts[m.saltName] > 1);
}

async function findMedicineWithNoSaltAlt(page) {
  const meds = await allMedicines(page);
  const published = meds.filter((m) => m.status === 'published');
  const counts = {};
  published.forEach((m) => {
    counts[m.saltName] = (counts[m.saltName] || 0) + 1;
  });
  return published.find((m) => counts[m.saltName] === 1);
}

async function findMedicineWithSameMfrAlt(page) {
  const meds = await allMedicines(page);
  const published = meds.filter((m) => m.status === 'published');
  const counts = {};
  published.forEach((m) => {
    counts[m.manufacturerId] = (counts[m.manufacturerId] || 0) + 1;
  });
  return published.find((m) => counts[m.manufacturerId] > 1);
}

Given('I open the detail page for a known medicine', async function () {
  const meds = await allMedicines(this.page);
  this.testMedicine = meds.find((m) => m.status === 'published');
  await this.gotoPage(`pages/medicine-detail.html?id=${this.testMedicine.id}`);
  await this.page.waitForSelector('#allSections:not(.hidden)', { timeout: 10000 });
});

When('I open the detail page with an id that does not exist', async function () {
  await this.gotoPage('pages/medicine-detail.html?id=nonexistent_id_zzz');
  await this.page.waitForSelector('#errorState:not(.hidden)', { timeout: 10000 });
});

When('I open the detail page with no id', async function () {
  await this.gotoPage('pages/medicine-detail.html');
  await this.page.waitForSelector('#errorState:not(.hidden)', { timeout: 10000 });
});

Then('the error state is shown', async function () {
  await expect(this.page.locator('#errorState')).toBeVisible();
});

Then('the brand name, salt name, price, and manufacturer match the source data', async function () {
  await expect(this.page.locator('#medBrandName')).toHaveText(this.testMedicine.brandName);
  await expect(this.page.locator('#medSaltName')).toHaveText(this.testMedicine.saltName);
  await expect(this.page.locator('#medManufacturer')).toHaveText(this.testMedicine.manufacturer);
  const price = (this.testMedicine.sellingPricePaise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  await expect(this.page.locator('#medPrice')).toHaveText(`₹${price}`);
});

Given('I open the detail page for a medicine that has same-salt alternatives', async function () {
  this.testMedicine = await findMedicineWithSameSaltAlt(this.page);
  await this.gotoPage(`pages/medicine-detail.html?id=${this.testMedicine.id}`);
  await this.page.waitForSelector('#allSections:not(.hidden)', { timeout: 10000 });
});

Given('I open the detail page for a medicine with no same-salt alternatives', async function () {
  this.testMedicine = await findMedicineWithNoSaltAlt(this.page);
  await this.gotoPage(`pages/medicine-detail.html?id=${this.testMedicine.id}`);
  await this.page.waitForSelector('#allSections:not(.hidden)', { timeout: 10000 });
});

Given('I open the detail page for a medicine that has same-manufacturer alternatives', async function () {
  this.testMedicine = await findMedicineWithSameMfrAlt(this.page);
  await this.gotoPage(`pages/medicine-detail.html?id=${this.testMedicine.id}`);
  await this.page.waitForSelector('#allSections:not(.hidden)', { timeout: 10000 });
});

When('I open the salt modal', async function () {
  await this.page.evaluate(() => window.openSaltModal());
  await this.page.waitForTimeout(150);
});

Then('the salt modal lists medicines with the same salt name', async function () {
  await expect(this.page.locator('#saltModalBody')).toBeVisible();
  const count = await this.page.locator('#saltModalBody > div').count();
  expect(count).toBeGreaterThan(0);
});

Then('the salt modal title mentions the salt name', async function () {
  const title = await this.page.locator('#saltModalTitle').innerText();
  expect(title).toContain(this.testMedicine.saltName);
});

Then('the salt modal shows the {string} fallback message', async function (phrase) {
  const bodyText = await this.page.locator('#saltModalBody').innerText();
  expect(bodyText.toLowerCase()).toContain(phrase.toLowerCase());
});

When('I search the salt modal for a term with no matches', async function () {
  await this.page.fill('#saltSearch', 'zzzznomatchzzzz');
  await this.page.waitForTimeout(150);
});

Then('the salt modal shows a {string} message', async function (phrase) {
  const bodyText = await this.page.locator('#saltModalBody').innerText();
  expect(bodyText.toLowerCase()).toContain(phrase.toLowerCase());
});

When('I open the manufacturer modal', async function () {
  await this.page.evaluate(() => window.openMfrModal());
  await this.page.waitForTimeout(150);
});

Then('the manufacturer modal lists medicines from the same manufacturer', async function () {
  await expect(this.page.locator('#mfrModalBody')).toBeVisible();
  const count = await this.page.locator('#mfrModalBody > div').count();
  expect(count).toBeGreaterThan(0);
});

When('I open the query modal via Send Query', async function () {
  await this.page.click('button[onclick="window.sendQuery()"]');
  await expect(this.page.locator('#queryModal')).toBeVisible();
});

Then('the page has not navigated away', async function () {
  expect(this.page.url()).toContain('medicine-detail.html');
});

When('I open the call modal', async function () {
  await this.page.click('button[onclick="window.openCallModal()"]');
  await expect(this.page.locator('#callModal')).toBeVisible();
});

When('I enter a valid phone number and submit the call request', async function () {
  await this.page.fill('#callPhone', '9876543210');
  await this.page.click('button[onclick="window.submitCallRequest()"]');
});

Then('the call success state is shown', async function () {
  await expect(this.page.locator('#callModalSuccess')).toBeVisible();
});

When('I enter an invalid phone number and submit the call request', async function () {
  await this.page.fill('#callPhone', '123');
  await this.page.click('button[onclick="window.submitCallRequest()"]');
});

Then('a call phone validation error is shown', async function () {
  await expect(this.page.locator('#callPhoneError')).toBeVisible();
});

When('I open the first FAQ', async function () {
  await this.page.locator('#faqList .faq-btn').nth(0).click();
});

When('I open the second FAQ', async function () {
  await this.page.locator('#faqList .faq-btn').nth(1).click();
});

Then('only the second FAQ is open', async function () {
  const openStates = await this.page
    .locator('#faqList .faq-answer')
    .evaluateAll((els) => els.map((el) => el.classList.contains('open')));
  expect(openStates[0]).toBe(false);
  expect(openStates[1]).toBe(true);
});

When('I scroll to the {string} section', async function (sectionId) {
  await this.page.setViewportSize({ width: 1400, height: 900 });
  // setupScrollSpy uses rootMargin '-20% 0px -70% 0px', a narrow band around
  // 20-30% down the viewport — scroll the section's top edge there directly
  // rather than relying on scrollIntoViewIfNeeded's default (top-of-viewport).
  await this.page.locator(`#${sectionId}`).evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const targetY = window.scrollY + rect.top - window.innerHeight * 0.25;
    window.scrollTo({ top: targetY, behavior: 'instant' });
  });
  await this.page.waitForTimeout(500);
});

Then('the {string} quick link becomes active', async function (sectionId) {
  const activeHref = await this.page.locator('#quickLinks .quick-link.active').getAttribute('href');
  expect(activeHref).toBe(`#${sectionId}`);
});

When('I add the medicine to cart from the detail page', async function () {
  await this.page.click('#addToCartBtn');
  await this.page.waitForTimeout(200);
});
