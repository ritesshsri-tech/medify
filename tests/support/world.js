const { setWorldConstructor, World } = require('@cucumber/cucumber');

class MedifyWorld extends World {
  constructor(options) {
    super(options);
    this.baseUrl = options.parameters.baseUrl;
    this.browser = null;
    this.context = null;
    this.page = null;
    this.consoleErrors = [];
  }

  async gotoPage(path) {
    await this.page.goto(`${this.baseUrl}/${path.replace(/^\//, '')}`);
  }

  async setViewport(width, height = 900) {
    await this.page.setViewportSize({ width, height });
  }
}

setWorldConstructor(MedifyWorld);
