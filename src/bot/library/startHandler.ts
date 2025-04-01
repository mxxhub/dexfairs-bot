import { removeAnswerCallback } from "./index";
import { bot } from "../index";

export const startHandler = async (msg: any) => {
  try {
    removeAnswerCallback(msg.chat);

    await bot.sendMessage(
      msg.chat.id,
      "Hello! I'm a bot. I can detect new pairs on Dexscreener.",
      {
        parse_mode: "HTML",
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [{ text: "🟢 Get New Pairs", callback_data: "getNewPair" }],
            [
              {
                text: "🟠 Monitor MarketCap",
                callback_data: "monitorMarketCap",
              },
            ],
          ],
        },
      }
    );
  } catch (error) {
    console.error("Error in start handler:", error);
  }
};
