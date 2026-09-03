const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('playwright/test');

When('I visit the homepage', async function () {
  await this.gotoPage('index.html');
});

Given('I am on the homepage', async function () {
  await this.gotoPage('index.html');
  await this.page.waitForSelector('header.site-header');
});

Then('I remain on the homepage', async function () {
  await this.page.waitForSelector('header.site-header', { timeout: 10000 });
  expect(this.page.url()).toMatch(/\/index\.html$/);
});

When('I search from the homepage for {string}', async function (term) {
  // The hero search uses shared classes rather than ids, because the page can
  // render more than one search form (hero + mobile row) and duplicate ids
  // would break the shared submit handler.
  const form = this.page.locator('.hero .index-search-form');
  await form.locator('.index-search-input').fill(term);
  await form.locator('button[type="submit"]').click();
  await this.page.waitForTimeout(200);
});

Then('I am navigated to the category page with search query {string}', async function (term) {
  await this.page.waitForURL(/category\.html\?search=/, { timeout: 5000 });
  expect(this.page.url()).toContain(`search=${encodeURIComponent(term)}`);
});

Then('the page has not navigated away from the homepage', async function () {
  expect(this.page.url()).toMatch(/\/index\.html$/);
});

When('I click the {string} nav link', async function (label) {
  await this.page.click(`nav.main-nav ul li a:has-text("${label}")`);
  await this.page.waitForTimeout(150);
});

Then('the URL hash becomes {string}', async function (hash) {
  const currentHash = await this.page.evaluate(() => window.location.hash);
  expect(currentHash).toBe(hash);
});

Then('the homepage product category grid shows {int} column\\(s)', async function (columns) {
  const colCount = await this.page.locator('.cat-grid').evaluate((el) => {
    return getComputedStyle(el).gridTemplateColumns.split(' ').length;
  });
  expect(colCount).toBe(columns);
});

Then('the mobile nav menu is closed', async function () {
  const display = await this.page.locator('nav.main-nav ul').evaluate((el) => getComputedStyle(el).display);
  expect(display).toBe('none');
});

When('I click the mobile nav toggle', async function () {
  await this.page.click('.nav-toggle');
  await this.page.waitForTimeout(150);
});

Then('the mobile nav menu is open', async function () {
  const display = await this.page.locator('nav.main-nav ul').evaluate((el) => getComputedStyle(el).display);
  expect(display).toBe('flex');
});

Then('the page has no more than {int}px of horizontal overflow', async function (maxPx) {
  const overflow = await this.page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(maxPx);
});
