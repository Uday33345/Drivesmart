const DriverFactory = require('../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');
const AdminDashboardPage = require('../pages/AdminDashboardPage');

describe('DriveSmart E2E Test Suite - Admin Platform Operations', function () {
  this.timeout(40000);
  let driver;
  let loginPage;
  let adminPage;

  before(async function () {
    driver = await DriverFactory.createDriver();
    loginPage = new LoginPage(driver);
    adminPage = new AdminDashboardPage(driver);

    await loginPage.selectRoleAndContinue('Admin');
    await loginPage.login('admin@drivesmart.com', 'password123');
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('TC-ADSH-001: Should load Admin dashboard metrics and navigate to User control', async function () {
    await adminPage.open();
    await adminPage.goToUsers();
  });
});
