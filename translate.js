const fs = require("fs");
const { Translate } = require("@google-cloud/translate").v2;
process.env.GOOGLE_APPLICATION_CREDENTIALS = "./service.json"; // 确保这里的路径正确指向你的服务账号密钥文件

// 初始化Google翻译客户端
const translate = new Translate();

// 读取你的文件内容（假设是JSON格式）
const fileContent = require("./th2.js"); // 确保文件路径正确

let totalTranslations = 0; // 翻译的总数
let completedTranslations = 0; // 已完成的翻译数

// 函数：计算需要翻译的字符串数量
function countTranslatableStrings(obj) {
  let count = 0;
  for (let key in obj) {
    if (typeof obj[key] === "string") {
      count++;
    } else if (typeof obj[key] === "object") {
      count += countTranslatableStrings(obj[key]); // 递归计算嵌套对象
    }
  }
  return count;
}

// 函数：翻译文本
async function translateText(text, targetLanguage) {
  try {
    let [translated] = await translate.translate(text, targetLanguage);
    completedTranslations++; // 每完成一次翻译，增加计数
    console.log(`Progress: ${completedTranslations}/${totalTranslations}`);
    return translated;
  } catch (error) {
    console.error("Error:", error);
    return text; // 发生错误时返回原始文本
  }
}

// 函数：递归翻译对象中的所有字符串
async function translateObject(obj) {
  for (let key in obj) {
    if (typeof obj[key] === "string") {
      console.log(`Translating [${key}]`);
      obj[key] = await translateText(obj[key], "th"); // 目标语言代码
    } else if (typeof obj[key] === "object") {
      await translateObject(obj[key]); // 递归处理嵌套对象
    }
  }
}

// 主函数：开始翻译流程
async function main() {
  totalTranslations = countTranslatableStrings(fileContent); // 计算需要翻译的总数
  await translateObject(fileContent);
  // 将翻译后的对象写回到新文件中
  fs.writeFile(
    "th_translated.js",
    "export default " + JSON.stringify(fileContent, null, 2),
    (err) => {
      if (err) throw err;
      console.log("The file has been saved with all translated content!");
    }
  );
}

main();
