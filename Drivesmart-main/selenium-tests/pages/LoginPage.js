const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.learnerRoleBtn = By.xpath("//button[contains(., 'Learner')]");
    this.instructorRoleBtn = By.xpath("//button[contains(., 'Instructor')]");
    this.adminRoleBtn = By.xpath("//button[contains(., 'Admin')]");
    this.continueBtn = By.xpath("//button[contains(., 'Continue')]");
    
    this.emailInput = By.xpath("//input[@type='email']");
    this.passwordInput = By.xpath("//input[@type='password']");
    this.signInBtn = By.xpath("//button[contains(., 'Sign In') or contains(., 'Log In')]");
    this.googleSignInBtn = By.xpath("//button[contains(., 'Google')]");
    
    this.googleModalInput = By.xpath("//input[@placeholder='name@example.com']");
    this.googleModalSubmitBtn = By.xpath("//button[contains(., 'Continue with Google')]");
  }

  async selectRoleAndContinue(roleName) {
    await this.navigateTo('/role-select');
    if (roleName.toLowerCase() === 'learner') {
      await this.click(this.learnerRoleBtn);
    } else if (roleName.toLowerCase() === 'instructor') {
      await this.click(this.instructorRoleBtn);
    } else if (roleName.toLowerCase() === 'admin') {
      await this.click(this.adminRoleBtn);
    }
    await this.click(this.continueBtn);
  }

  async login(email, password) {
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, password);
    await this.click(this.signInBtn);
  }

  async loginWithGoogleDemo(email) {
    await this.click(this.googleSignInBtn);
    await this.type(this.googleModalInput, email);
    await this.click(this.googleModalSubmitBtn);
  }
}

module.exports = LoginPage;
