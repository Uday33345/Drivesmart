const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class AdminDashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.totalUsersMetric = By.xpath("//*[contains(text(), 'Total Users')]");
    this.usersTabLink = By.xpath("//a[contains(@href, '/admin/users')]");
    this.instructorsTabLink = By.xpath("//a[contains(@href, '/admin/instructors')]");
    this.revenueTabLink = By.xpath("//a[contains(@href, '/admin/revenue')]");
  }

  async open() {
    await this.navigateTo('/admin');
  }

  async goToUsers() {
    await this.click(this.usersTabLink);
  }

  async goToInstructors() {
    await this.click(this.instructorsTabLink);
  }

  async goToRevenue() {
    await this.click(this.revenueTabLink);
  }
}

module.exports = AdminDashboardPage;
