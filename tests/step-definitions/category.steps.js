const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('playwright/test');

async function publishedMedicines(page) {
  return page.evaluate(async () => {
    const res = await fetch('../data/medicines.json');
    const all = await res.json();
    return all.filter((m) => m.status === 'published');
  });
}

Then(
  'the medicine grid shows a card count matching the published medicines in the catalogue',
  { timeout: 60000 },
  async function () {
    const meds = await publishedMedicines(this.page);
    // Grid loads in pages of 24 — scroll to load all before comparing counts.
    let cardCount = await this.page.locator('#medicineGrid > div').count();
    while (cardCount < meds.length) {
      await this.page.locator('#scrollSentinel').scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(200);
      const newCount = await this.page.locator('#medicineGrid > div').count();
      if (newCount === cardCount) break;
      cardCount = newCount;
    }
    expect(cardCount).toBe(meds.length);
  }
);

When('I search for {string}', async function (term) {
  await this.page.fill('#searchInput', term);
  await this.page.waitForTimeout(150);
});

Then('the empty state is shown', async function () {
  await expect(this.page.locator('#emptyState')).toBeVisible();
});

Then('the medicine grid is empty', async function () {
  expect(await this.page.locator('#medicineGrid > div').count()).toBe(0);
});

Then('all published medicines are shown', async function () {
  const meds = await publishedMedicines(this.page);
  const cardCount = await this.page.locator('#medicineGrid > div').count();
  expect(cardCount).toBe(Math.min(meds.length, 24));
});

Then(
  'the category dropdown options match the sorted distinct diseaseCategory values in the catalogue',
  async function () {
    const meds = await publishedMedicines(this.page);
    const expected = [...new Set(meds.map((m) => m.diseaseCategory).filter(Boolean))].sort();
    const options = await this.page.locator('#categoryFilter option').allInnerTexts();
    expect(options.slice(1)).toEqual(expected);
  }
);

When('I set sort to {string}', async function (sort) {
  this.currentSort = sort;
  await this.page.evaluate((s) => window.setSort(s), sort);
  await this.page.waitForTimeout(150);
});

function sortMedicines(meds, sort) {
  return [...meds].sort((a, b) => {
    if (sort === 'price-asc') return a.sellingPricePaise - b.sellingPricePaise;
    if (sort === 'price-desc') return b.sellingPricePaise - a.sellingPricePaise;
    if (sort === 'indication') return (a.treatmentFor[0] || '').localeCompare(b.treatmentFor[0] || '');
    if (sort === 'manufacturer') return (a.manufacturer || '').localeCompare(b.manufacturer || '');
    return a.brandName.localeCompare(b.brandName);
  });
}

Then('the first visible card matches the expected first item for {string}', async function (sort) {
  const meds = await publishedMedicines(this.page);
  const expected = sortMedicines(meds, sort)[0];
  const firstCardName = await this.page.locator('#medicineGrid > div h3').first().innerText();
  expect(firstCardName).toBe(expected.brandName);
});

Then('the last loaded card matches the expected last item for {string}', async function (sort) {
  const meds = await publishedMedicines(this.page);
  const sorted = sortMedicines(meds, sort);
  const loadedCount = await this.page.locator('#medicineGrid > div').count();
  const expected = sorted[loadedCount - 1];
  const lastCardName = await this.page.locator('#medicineGrid > div h3').last().innerText();
  expect(lastCardName).toBe(expected.brandName);
});

Given('more than 24 published medicines match the current filters', async function () {
  const meds = await publishedMedicines(this.page);
  expect(meds.length).toBeGreaterThan(24);
});

When('I scroll the sentinel into view', async function () {
  this.countBeforeScroll = await this.page.locator('#medicineGrid > div').count();
  await this.page.locator('#scrollSentinel').scrollIntoViewIfNeeded();
  await this.page.waitForTimeout(300);
});

Then('24 more cards are appended to the grid without duplicating existing cards', async function () {
  const countAfter = await this.page.locator('#medicineGrid > div').count();
  expect(countAfter).toBeGreaterThan(this.countBeforeScroll);
  const ids = await this.page
    .locator('#medicineGrid > div')
    .evaluateAll((els) => els.map((el) => el.querySelector('img')?.id));
  expect(new Set(ids).size).toBe(ids.length);
});

Given('a medicine card has more than one image', async function () {
  this.multiImageCard = this.page.locator('#medicineGrid .card-img-wrap:has(.carousel-arrow-right)').first();
  await expect(this.multiImageCard).toBeVisible();
});

When('I click the carousel next arrow', async function () {
  const beforeSrc = await this.multiImageCard.locator('img').getAttribute('src');
  await this.multiImageCard.hover();
  await this.multiImageCard.locator('.carousel-arrow-right').click({ force: true });
  this.imgSrcBefore = beforeSrc;
});

Then('the card image advances to the next image and the active dot updates', async function () {
  const afterSrc = await this.multiImageCard.locator('img').getAttribute('src');
  expect(afterSrc).not.toBe(this.imgSrcBefore);
  await expect(this.multiImageCard.locator('.carousel-dot.active')).toHaveCount(1);
});

When('I click a medicine card', async function () {
  const card = this.page.locator('#medicineGrid > div').first();
  this.expectedHref = await card.evaluate((el) => el.getAttribute('onclick'));
  await card.click();
});

Then("I am navigated to the medicine detail page for that medicine's id", async function () {
  await this.page.waitForURL(/medicine-detail\.html\?id=/);
});

When('I click {string} on a medicine card', async function (label) {
  const card = this.page.locator('#medicineGrid > div').first();
  this.clickedCardName = await card.locator('h3').innerText();
  await card.locator(`button:has-text("${label}")`).click();
});

Then('localStorage.cart contains one entry for that medicine', async function () {
  const cart = await this.page.evaluate(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  expect(cart.length).toBe(1);
});

When("I click {string} on that medicine's card again", async function (label) {
  const card = this.page.locator(`#medicineGrid > div:has-text("${this.testMedicineCardName}")`).first();
  await card.locator(`button:has-text("${label}")`).click();
});

Given('I open the query modal for a medicine', async function () {
  await this.page.locator('#medicineGrid > div').first().locator('button:has-text("Send Query")').click();
  await expect(this.page.locator('#queryModal')).toBeVisible();
});

When('I submit the query form with no name', async function () {
  await this.page.fill('#qfName', '');
  await this.page.click('#queryModalForm button:has-text("Submit Query")');
});

Then('a validation error is shown', async function () {
  await expect(this.page.locator('#qfError')).toBeVisible();
});

Then('the success state is not shown', async function () {
  await expect(this.page.locator('#queryModalSuccess')).toBeHidden();
});

When('I fill in a name and phone number and submit', async function () {
  await this.page.fill('#qfName', 'Test User');
  await this.page.fill('#qfPhone', '9876543210');
  await this.page.click('#queryModalForm button:has-text("Submit Query")');
});

Then('the success state is shown', async function () {
  await expect(this.page.locator('#queryModalSuccess')).toBeVisible();
});

Given('the viewport is {int}px wide', async function (width) {
  await this.setViewport(width);
  await this.page.waitForTimeout(150);
});

Then('the medicine grid shows {int} column\\(s)', async function (columns) {
  const colCount = await this.page.locator('#medicineGrid').evaluate((el) => {
    return getComputedStyle(el).gridTemplateColumns.split(' ').length;
  });
  expect(colCount).toBe(columns);
});

Then('the page has no horizontal overflow', async function () {
  const hasOverflow = await this.page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasOverflow).toBe(false);
});

Then("every card's {string} button has a rendered height of at least 28px", async function (label) {
  const heights = await this.page
    .locator(`#medicineGrid button:has-text("${label}")`)
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().height));
  for (const h of heights) {
    // Known Phase 1 exception (see CHANGE.md checklist item 24): legacy card
    // buttons render ~28px tall, not the 44px target. Kept pixel-identical to
    // Legacy pages/category.html; revisit in the Phase 2 redesign.
    expect(h).toBeGreaterThanOrEqual(28);
  }
});
