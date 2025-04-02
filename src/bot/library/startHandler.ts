import { removeAnswerCallback } from "./index";
import { bot } from "../index";

export const startHandler = async (msg: any) => {
  try {
    removeAnswerCallback(msg.chat);

    await bot.sendMessage(
      msg.chat.id,
      `🎉🎉🎉 <b>Welcome to All Time Low Bot!</b> 🎉🎉🎉

You can subscribe the below channels to get the latest pairs and marketcap alerts:

<a href="https://t.me/+NOClaexcINZhM2Ex">20K Channel</a>  |  <a href="https://t.me/+xMgIa2TAnj8yMDdh">50K Channel</a>  |  <a href="https://t.me/+JjBn1pl9BcQ2MWUx">1M Channel</a>`,
      {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }
    );
  } catch (error) {
    console.error("Error in start handler:", error);
  }
};
