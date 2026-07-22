const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class InstructorDashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.onlineToggle = By.xpath("//button[contains(@class, 'rounded-full')]");
    this.todayScheduleHeader = By.xpath("//*[contains(text(), 'Today') or contains(text(), 'Schedule')]");
    this.earningsLink = By.xpath("//a[contains(@href, '/instructor/earnings')]");
  }

  async open() {
    await this.navigateTo('/instructor');
  }

  async toggleAvailability() {
    await this.click(this.onlineToggle);
  }
}

module.exports = InstructorDashboardPage;
