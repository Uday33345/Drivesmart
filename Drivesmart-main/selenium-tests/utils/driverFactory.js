const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const config = require('../config/config');

class DriverFactory {
  static async createDriver() {
    let options = new chrome.Options();
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    
    if (config.headless) {
      options.addArguments('--headless=new');
    }

    let driver = await new Builder()
      .forBrowser(config.browser)
      .setChromeOptions(options)
      .build();

    await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 30000 });
    await driver.manage().window().maximize();
    return driver;
  }
}

module.exports = DriverFactory;
