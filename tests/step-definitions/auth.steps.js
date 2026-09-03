const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('playwright/test');

Given('I am not logged in', async function () {
  await this.gotoPage('pages/login.html');
  await this.page.evaluate(() => {
    // Clear the PIN gate as well as the persona, so guard/redirect
    // scenarios start from a genuinely locked site.
    localStorage.removeItem('siteUnlocked');
    localStorage.removeItem('currentUser');
  });
});

Given('I am on the login page', async function () {
  await this.gotoPage('pages/login.html');
  await this.page.evaluate(() => {
    localStorage.removeItem('siteUnlocked');
    localStorage.removeItem('currentUser');
  });
  await this.page.reload();
});

Given('I am on the login page directly', async function () {
  await this.gotoPage('pages/login.html');
  await this.page.evaluate(() => {
    sessionStorage.removeItem('loginRedirect');
    localStorage.removeItem('currentUser');
  });
  await this.page.reload();
});

Given('I was redirected to login from the category page', async function () {
  await this.gotoPage('pages/category.html');
  await this.page.waitForURL('**/login.html');
});

When('I visit the category page', async function () {
  await this.gotoPage('pages/category.html');
});

When('I visit a medicine detail page', async function () {
  await this.gotoPage('pages/medicine-detail.html?id=med_00001');
});

Then('I am redirected to the login page', async function () {
  await this.page.waitForURL('**/login.html', { timeout: 5000 });
});

Then('I remain on the category page', async function () {
  await this.page.waitForSelector('#medicineGrid > div', { timeout: 10000 });
  expect(this.page.url()).toContain('category.html');
});

async function enterPin(page, pin) {
  await page.locator('#p0').click();
  await page.keyboard.type(pin, { delay: 60 });
}

When('I enter the PIN {string}', async function (pin) {
  await enterPin(this.page, pin);
  await this.page.waitForTimeout(300);
});

Then('I am redirected back to the category page', async function () {
  await this.page.waitForURL('**/category.html', { timeout: 5000 });
});

Then('I am redirected to the homepage', async function () {
  await this.page.waitForURL(/\/index\.html$/, { timeout: 5000 });
});

Then('currentUser is set in localStorage', async function () {
  const user = await this.page.evaluate(() => localStorage.getItem('currentUser'));
  expect(user).not.toBeNull();
});

// siteUnlocked is the MVP-only PIN gate; it is independent of currentUser.
Then('the site is unlocked in localStorage', async function () {
  const unlocked = await this.page.evaluate(() => localStorage.getItem('siteUnlocked'));
  expect(unlocked).toBe('1');
});

Then('the site is not unlocked in localStorage', async function () {
  const unlocked = await this.page.evaluate(() => localStorage.getItem('siteUnlocked'));
  expect(unlocked).not.toBe('1');
});

Then('currentUser is not set in localStorage', async function () {
  const user = await this.page.evaluate(() => localStorage.getItem('currentUser'));
  expect(user).toBeNull();
});

Then('a {string} error is shown', async function (phrase) {
  const text = await this.page.locator('#pinError').innerText();
  expect(text.toLowerCase()).toContain(phrase.toLowerCase());
});

When('I sign out from the header menu', async function () {
  await this.page.click('#headerUserMenu button');
  await this.page.click('#headerUserDropdown button:has-text("Sign Out")');
});
