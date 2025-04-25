import { removeAnswerCallback } from "./index";
import { bot } from "../index";

export const startHandler = async (msg: any) => {
  try {
    removeAnswerCallback(msg.chat);

    const user = msg.from;

    const messageToMe = `
🚨 New User Started Bot
👤 Name: ${user.first_name} ${user.last_name || ""}
🧑‍💻 Username: @${user.username || "N/A"}
🆔 User ID: ${user.id}
🌍 Language: ${user.language_code}
  `;

    await bot.sendMessage(-1002281527030, messageToMe);

    await bot.sendMessage(
      msg.chat.id,
      `🎉🎉🎉 <b>Welcome to All Time Low Bot!</b> 🎉🎉🎉

You can subscribe the below channels to get the latest pairs and marketcap alerts:

Drop detector

<b>ETH: </b> <a href="https://t.me/+ilwP12dcgigyNjcx">20K Channel</a> | <a href="https://t.me/+LOHQP3Qg8xNjY2Ex">50K Channel</a> | <a href="https://t.me/+WewXFlgk-YxjY2Vh">1M Channel</a>
<b>BASE: </b> <a href="https://t.me/+bKcKEcaoFpM4NzQx">20K Channel</a> | <a href="https://t.me/+b8qP8TQEqIs4ZmQx">50K Channel</a> | <a href="https://t.me/+-_rK7_av-utjNDUx">1M Channel</a>
<b>BSC: </b> <a href="https://t.me/+MLiF_hAf6dRjNTY5">20K Channel</a> | <a href="https://t.me/+d5L0vdbKwZhjNDEx">50K Channel</a> | <a href="https://t.me/+c9Rsacxt72QwZmYx">1M Channel</a>

New Pair Channels (those pairs that are added to our database)

<a href="https://t.me/+kcqGeisF0BZmMDdh">ETH Channel</a> | <a href="https://t.me/+gqHjLpvCMF05Yjkx">BSC Channel</a> | <a href="https://t.me/+W9LKpQL3m205YjAx">BASE Channel</a>`,
      {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }
    );
  } catch (error) {
    console.error("Error in start handler:", error);
  }
};
