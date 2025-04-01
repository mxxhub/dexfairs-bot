import { bot } from "../index";
import { startHandler } from "../library/startHandler";
const { Commands } = require("../index");

export default new Commands(
  /^\/start$/,
  "Start the bot",
  "start",
  true,
  async (msg: any) => {
    const fromId = msg.from.id;
    const chatId = msg.chat.id;
    if (fromId != chatId) {
      await bot.sendMessage(
        msg.chat.id,
        "You are not authorized to use this bot"
      );
      return;
    }
    startHandler(msg);
  }
);
