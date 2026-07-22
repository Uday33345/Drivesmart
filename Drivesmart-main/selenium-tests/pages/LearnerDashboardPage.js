const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class LearnerDashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.welcomeBanner = By.xpath("//*[contains(text(), 'Welcome back') or contains(text(), 'Hello')]");
    this.bookLessonBtn = By.xpath("//button[contains(., 'Book New Lesson')]");
    this.walletTopUpBtn = By.xpath("//button[contains(., 'Top Up')]");
    this.walletBalanceText = By.xpath("//*[contains(text(), '$')]");
    this.searchInput = By.xpath("//input[@placeholder='Search by name or area...']");
  }

  async open() {
    await this.navigateTo('/learner');
  }

  async clickBookLesson() {
    await this.click(this.bookLessonBtn);
  }

  async clickWalletTopUp() {
    await this.click(this.walletTopUpBtn);
  }

  async searchInstructor(name) {
    await this.type(this.searchInput, name);
  }
}

module.exports = LearnerDashboardPage;
