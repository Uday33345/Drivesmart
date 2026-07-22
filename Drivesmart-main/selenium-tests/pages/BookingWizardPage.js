const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class BookingWizardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.instructorCard = By.xpath("//div[contains(@class, 'cursor-pointer')]");
    this.nextPackageBtn = By.xpath("//button[contains(., 'Next: Choose Package')]");
    this.packageOption = By.xpath("//*[contains(text(), 'Package') or contains(text(), 'Single')]");
    this.nextScheduleBtn = By.xpath("//button[contains(., 'Next: Schedule')]");
    this.timeSlotBtn = By.xpath("//button[contains(@class, 'border')]");
    this.nextPaymentBtn = By.xpath("//button[contains(., 'Next: Payment')]");
    this.confirmBookingBtn = By.xpath("//button[contains(., 'Confirm Booking')]");
    this.successConfirmation = By.xpath("//*[contains(text(), 'Booking Confirmed!')]");
  }

  async open() {
    await this.navigateTo('/learner/book');
  }

  async completeFullBooking() {
    await this.open();
    await this.click(this.instructorCard);
    await this.click(this.nextPackageBtn);
    await this.click(this.packageOption);
    await this.click(this.nextScheduleBtn);
    await this.click(this.timeSlotBtn);
    await this.click(this.nextPaymentBtn);
    await this.click(this.confirmBookingBtn);
  }
}

module.exports = BookingWizardPage;
