const { expect } = require('chai');
const DriverFactory = require('../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');

describe('DriveSmart E2E Test Suite - Authentication & Role Selection', function () {
  this.timeout(40000);
  let driver;
  let loginPage;

  before(async function () {
    driver = await DriverFactory.createDriver();
    loginPage = new LoginPage(driver);
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('TC-AUTH-001 & 002: Should select Learner role and navigate to Learner Login page', async function () {
    await loginPage.selectRoleAndContinue('Learner');
    const currentUrl = await loginPage.getCurrentUrl();
    console.log('Current URL after role selection:', currentUrl);
  });

  it('TC-AUTH-005: Should sign in with valid Learner credentials in Demo Mode', async function () {
    await loginPage.login('learner@drivesmart.com', 'password123');
  });

  it('TC-AUTH-012 & 013: Should trigger Google OAuth demo modal without crash', async function () {
    await loginPage.selectRoleAndContinue('Learner');
    await loginPage.loginWithGoogleDemo('googleuser@drivesmart.com');
  });
});
