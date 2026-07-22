const path = require('path');

module.exports = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS === 'true',
  defaultTimeout: 10000,
  apkPath: path.resolve(__dirname, '../../android/app/build/outputs/apk/debug/app-debug.apk'),
  appiumServerUrl: process.env.APPIUM_URL || 'http://127.0.0.1:4723/wd/hub',
  mobileCapabilities: {
    platformName: 'Android',
    automationName: 'UiAutomator2',
    deviceName: 'Android Emulator',
    appPackage: 'com.drivepro.app',
    appActivity: 'com.drivepro.app.MainActivity'
  }
};
