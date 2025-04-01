import { bot } from "../index";
import dotenv from "dotenv";
import { getNewPairInfoHandler } from "../library/getNewPairInfoHandler";
dotenv.config();

const { Commands } = require("../index.ts");

export default new Commands(
  /^\/newpairs$/,
  "Get list of new pairs",
  "newpairs",
  true,
  async (msg: any) => {
    const fromId = msg.from.id;
    const chatId = msg.chat.id;
    if (fromId !== chatId) {
      bot.sendMessage(msg.chat.id, `This command can only be used in DM.`, {});
      return;
    }
    getNewPairInfoHandler(msg);
  }
);
