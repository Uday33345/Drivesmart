const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class LearnerWalletPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.balanceDisplay = By.xpath("//*[contains(text(), '$')]");
    this.addFundsBtn = By.xpath("//button[contains(., 'Add Funds')]");
    this.preset100Btn = By.xpath("//button[contains(., '$100')]");
    this.payNowBtn = By.xpath("//button[contains(., 'Pay Now') or contains(., 'Add')]");
  }

  async open() {
    await this.navigateTo('/learner/wallet');
  }

  async topUpPreset100() {
    await this.open();
    await this.click(this.addFundsBtn);
    await this.click(this.preset100Btn);
    await this.click(this.payNowBtn);
  }
}

module.exports = LearnerWalletPage;
