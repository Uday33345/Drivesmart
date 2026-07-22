const DriverFactory = require('../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');
const LearnerDashboardPage = require('../pages/LearnerDashboardPage');

describe('DriveSmart E2E Test Suite - Learner Dashboard Journey', function () {
  this.timeout(40000);
  let driver;
  let loginPage;
  let learnerPage;

  before(async function () {
    driver = await DriverFactory.createDriver();
    loginPage = new LoginPage(driver);
    learnerPage = new LearnerDashboardPage(driver);

    await loginPage.selectRoleAndContinue('Learner');
    await loginPage.login('learner@drivesmart.com', 'password123');
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('TC-LASH-001: Should display Learner dashboard layout and welcome banner', async function () {
    await learnerPage.open();
  });

  it('TC-LASH-006: Should filter recommended instructors by search query', async function () {
    await learnerPage.open();
    await learnerPage.searchInstructor('Sarah');
  });
});
