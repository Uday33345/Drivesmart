const DriverFactory = require('../utils/driverFactory');
const LoginPage = require('../pages/LoginPage');
const BookingWizardPage = require('../pages/BookingWizardPage');

describe('DriveSmart E2E Test Suite - 4-Step Booking Wizard', function () {
  this.timeout(40000);
  let driver;
  let loginPage;
  let bookingWizardPage;

  before(async function () {
    driver = await DriverFactory.createDriver();
    loginPage = new LoginPage(driver);
    bookingWizardPage = new BookingWizardPage(driver);

    await loginPage.selectRoleAndContinue('Learner');
    await loginPage.login('learner@drivesmart.com', 'password123');
  });

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('TC-BOOK-001 to 004: Should navigate through 4-step wizard and complete booking', async function () {
    await bookingWizardPage.open();
  });
});
