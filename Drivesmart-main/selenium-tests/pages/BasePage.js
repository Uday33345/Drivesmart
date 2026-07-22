const { until, By } = require('selenium-webdriver');
const config = require('../config/config');

class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.timeout = config.defaultTimeout;
  }

  async navigateTo(urlPath) {
    const fullUrl = config.baseUrl + urlPath;
    await this.driver.get(fullUrl);
  }

  async waitForElement(locator) {
    return await this.driver.wait(until.elementLocated(locator), this.timeout);
  }

  async waitForVisible(locator) {
    const el = await this.waitForElement(locator);
    return await this.driver.wait(until.elementIsVisible(el), this.timeout);
  }

  async click(locator) {
    const element = await this.waitForVisible(locator);
    await element.click();
  }

  async type(locator, text) {
    const element = await this.waitForVisible(locator);
    await element.clear();
    await element.sendKeys(text);
  }

  async getText(locator) {
    const element = await this.waitForVisible(locator);
    return await element.getText();
  }

  async isElementPresent(locator) {
    try {
      const elements = await this.driver.findElements(locator);
      return elements.length > 0;
    } catch (err) {
      return false;
    }
  }

  async getTitle() {
    return await this.driver.getTitle();
  }

  async getCurrentUrl() {
    return await this.driver.getCurrentUrl();
  }
}

module.exports = BasePage;
