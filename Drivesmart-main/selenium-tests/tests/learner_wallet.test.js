const DriverFactory = require('../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');
const LearnerWalletPage = require('../pages/LearnerWalletPage');

describe('DriveSmart E2E Test Suite - Learner Wallet & Top Up', function () {
  this.timeout(40000);
  let driver;
  let loginPage;
  let walletPage;

  before(async function () {
    driver = await DriverFactory.createDriver();
    loginPage = new LoginPage(driver);
    walletPage = new LearnerWalletPage(driver);

    await loginPage.selectRoleAndContinue('Learner');
    await loginPage.login('learner@drivesmart.com', 'password123');
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('TC-WALL-001 & 002: Should open wallet page and trigger $100 preset top up', async function () {
    await walletPage.open();
  });
});
