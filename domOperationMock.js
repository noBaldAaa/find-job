/**
 * 这里面都是模拟dom的操作
 */
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

// 全局 WebDriver 实例
let driver;

// 获取 WebDriver 实例
function getDriver() {
  return driver;
}

/**
 * 使用指定的选项打开浏览器
 */
async function openBrowserWithOptions(url, browser) {
  const options = new chrome.Options();
  options.addArguments("--detach");

  if (browser === "chrome") {
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();
    await driver.manage().window().maximize();
  } else {
    throw new Error("不支持的浏览器类型");
  }

  await driver.get(url);

  // 等待直到页面包含登录按钮dom
  const xpathLocator = By.xpath("//*[@id='header']/div[1]/div[3]/div/a");
  await driver.wait(until.elementLocated(xpathLocator), 10000);
}

// 点击登录按钮，并等待登录成功
async function logIn() {
  // 点击登录
  const loginButton = await driver.findElement(
    By.xpath("//*[@id='header']/div[1]/div[3]/div/a")
  );
  await loginButton.click();

  // 等待微信登录按钮出现
  const xpathLocatorWechatLogin =
    "//*[@id='wrap']/div/div[2]/div[2]/div[2]/div[1]/div[4]/a";
  await driver.wait(
    until.elementLocated(By.xpath(xpathLocatorWechatLogin)),
    10000
  );

  const wechatButton = await driver.findElement(
    By.xpath("//*[@id='wrap']/div/div[2]/div[2]/div[2]/div[1]/div[4]/a")
  );
  await wechatButton.click();

  const xpathLocatorWechatLogo =
    "//*[@id='wrap']/div/div[2]/div[2]/div[1]/div[2]/div[1]/img";
  await driver.wait(
    until.elementLocated(By.xpath(xpathLocatorWechatLogo)),
    10000
  );

  // 登录成功
  const xpathLocatorLoginSuccess = "//*[@id='header']/div[1]/div[3]/ul/li[2]/a";
  await driver.wait(
    until.elementLocated(By.xpath(xpathLocatorLoginSuccess)),
    60000
  );
}

// 根据索引获取职位描述
async function getJobDescriptionByIndex(index) {
  try {
    const jobSelector = `//*[@id='wrap']/div[2]/div[2]/div/div/div[1]/ul/li[${index}]`;
    const jobElement = await driver.findElement(By.xpath(jobSelector));
    // 点击招聘信息列表中的项
    await jobElement.click();

    // 找到描述信息节点并获取文字
    const descriptionSelector =
      "//*[@id='wrap']/div[2]/div[2]/div/div/div[2]/div/div[2]/p";
    await driver.wait(
      until.elementLocated(By.xpath(descriptionSelector)),
      10000
    );
    const jobDescriptionElement = await driver.findElement(
      By.xpath(descriptionSelector)
    );
    return jobDescriptionElement.getText();
  } catch (error) {
    console.log(`在索引 ${index} 处找不到工作。`);
    return null;
  }
}

module.exports = {
  getDriver,
  openBrowserWithOptions,
  logIn,
  getJobDescriptionByIndex,
};
