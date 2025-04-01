import { removeAnswerCallback } from "./index";
import { bot } from "../index";
import { startMarketCapMonitoring } from "../../utils/marketCapCron";

export const monitorMarketCapHandler = async (msg: any) => {
  try {
    removeAnswerCallback(msg.chat);
    await bot.sendMessage(
      msg.chat.id,
      "Market cap monitoring started. I will notify you if any pair drops below 20% of its market cap."
    );
    await startMarketCapMonitoring(msg);
  } catch (error) {
    console.error("Error in monitorMarketCapHandler:", error);
  }
};
