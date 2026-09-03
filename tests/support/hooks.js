const { Before, After, BeforeAll, AfterAll } = require('@cucumber/cucumber');
const { chromium } = require('playwright');

let sharedBrowser;

BeforeAll(async function () {
  sharedBrowser = await chromium.launch();
});

AfterAll(async function () {
  await sharedBrowser.close();
});

Before(async function () {
  this.browser = sharedBrowser;
  this.context = await this.browser.newContext();

  this.page = await this.context.newPage();
  this.consoleErrors = [];
  this.page.on('pageerror', (err) => this.consoleErrors.push(err.message));
  this.page.on('console', (msg) => {
    if (msg.type() === 'error') this.consoleErrors.push(msg.text());
  });
});

After(async function () {
  await this.context.close();
});
