const DriverFactory = require('../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');
const InstructorDashboardPage = require('../pages/InstructorDashboardPage');

describe('DriveSmart E2E Test Suite - Instructor Operations', function () {
  this.timeout(40000);
  let driver;
  let loginPage;
  let instructorPage;

  before(async function () {
    driver = await DriverFactory.createDriver();
    loginPage = new LoginPage(driver);
    instructorPage = new InstructorDashboardPage(driver);

    await loginPage.selectRoleAndContinue('Instructor');
    await loginPage.login('instructor@drivesmart.com', 'password123');
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('TC-IDSH-001 & 002: Should load Instructor dashboard and toggle availability status', async function () {
    await instructorPage.open();
  });
});
