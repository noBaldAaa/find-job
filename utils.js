/**
 * 工具函数
 */
const fs = require("fs");

// 模拟等待
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 读取简历信息
const getResumeInfo = () => {
  fs.readFile("./简历基本信息.txt", "utf8", (err, data) => {
    if (err) {
      console.error("读取文件时出错:", err);
      return;
    }

    // 输出文件内容
    return data;
  });
};

module.exports = {
  getResumeInfo,
  sleep,
};
