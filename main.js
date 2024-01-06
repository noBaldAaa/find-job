const { OpenAI } = require("openai");
const { By, Key, until } = require("selenium-webdriver");

const { getResumeInfo, sleep } = require("./utils");
const {
  getDriver,
  openBrowserWithOptions,
  logIn,
  getJobDescriptionByIndex,
} = require("./domOperationMock");

// 初始化OpenAI客户端
const openai = new OpenAI({
  baseURL: "https://api.chatanywhere.com.cn",
  apiKey: "你的 apiKey",
});

// 获取简历信息
const resumeInfo = getResumeInfo();

// 与GPT进行聊天的函数
async function chat(jobDescription) {
  const askMessage = `你好，这是我的简历：${resumeInfo}，这是我所应聘公司的要求：${jobDescription}。我希望您能帮我直接给HR写一个礼貌专业的求职新消息，要求能够用专业的语言将简历中的技能结合应聘工作的描述，来阐述自己的优势，尽最大可能打动招聘者。并且请您始终使用中文来进行消息的编写,开头是招聘负责人。这是一封完整的求职信，不要包含求职信内容以外的东西，例如“根据您上传的求职要求和个人简历，我来帮您起草一封求职邮件：”这一类的内容，以便于我直接自动化复制粘贴发送，字数控制在80字左右为宜`;
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: askMessage,
        },
      ],
      model: "gpt-3.5-turbo",
    });

    // 获取gpt返回的信息
    const formattedMessage = completion.choices[0].message.content.replace(
      /\n/g,
      " "
    );
    return formattedMessage;
  } catch (error) {
    console.error(`gpt返回时发生错误: ${error}`);
    const errorResponse = JSON.stringify({ error: String(error) });
    return errorResponse;
  }
}

// 发送响应到聊天框
async function sendResponseToChatBox(driver, response) {
  try {
    // 请找到聊天输入框
    const chatBox = await driver.findElement(By.xpath("//*[@id='chat-input']"));

    // 清除输入框中可能存在的任何文本
    await chatBox.clear();

    // 将响应粘贴到输入框
    await chatBox.sendKeys(response);
    await sleep(1000);

    // 模拟按下回车键来发送消息
    await chatBox.sendKeys(Key.RETURN);
    await sleep(2000); // 模拟等待1秒
  } catch (error) {
    console.error(`发送响应到聊天框时发生错误: ${error}`);
  }
}

// 主函数
async function main(url, browserType) {
  try {
    // 打开浏览器
    await openBrowserWithOptions(url, browserType);
    // 点击登录按钮，并等待登录成功
    await logIn();

    // 开始的索引
    let jobIndex = 1;

    while (true) {
      // 获取单例的浏览器窗口
      let driver = getDriver();

      // 获取对应下标的职位描述
      const jobDescription = await getJobDescriptionByIndex(jobIndex);
      console.log(`职位描述信息/n：${jobDescription}`);
      if (jobDescription) {
        // 发送描述到聊天并打印响应
        const response = await chat(jobDescription);
        console.log("gpt给的回复", response);

        // 点击沟通按钮
        const contactButton = await driver.findElement(
          By.xpath(
            "//*[@id='wrap']/div[2]/div[2]/div/div/div[2]/div/div[1]/div[2]/a[2]"
          )
        );
        await contactButton.click();

        // 等待回复框出现
        const chatBox = await driver.wait(
          until.elementLocated(By.xpath("//*[@id='chat-input']")),
          10000
        );

        // 调用函数发送响应
        await sendResponseToChatBox(driver, response);

        // 返回到上一个页面
        await driver.navigate().back();
        await sleep(2000); // 模拟等待3秒
      }
      jobIndex += 1;
    }
  } catch (error) {
    console.error(`发生错误: ${error}`);
  }
}

const url =
  "https://www.zhipin.com/web/geek/job-recommend?ka=header-job-recommend";
const browserType = "chrome";

main(url, browserType);
