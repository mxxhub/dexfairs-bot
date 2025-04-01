import cron from "node-cron";
import dotenv from "dotenv";
import { getPairDataFromDB } from "../db/contoller/getData";
import { getPairInfo } from "./getPairInfo";
import { sendMessage, sendToChannels } from "./sendMsgChannel";
import { bot } from "../bot/index";
import { getTargetChannels } from "./marketCapFilter";

dotenv.config();

interface PairData {
  chainId: string;
  pairAddress: string;
  marketCap: number;
}

export const startMarketCapMonitoring = (msg: any) => {
  console.log("start marketcap monitoring");
  // Run every minute
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("Running market cap check...");
      const pairs = await getPairDataFromDB();
      console.log("pairs", pairs);
      if (!pairs) return;

      // Process each pair
      await Promise.all(
        pairs.map(async (pair: PairData) => {
          try {
            const targetChannels = getTargetChannels(pair.marketCap);
            console.log("targetChannels", targetChannels);
            const pairInfo = await getPairInfo(pair.chainId, pair.pairAddress);
            console.log("pairInfo", pairInfo);
            const marketCapPercentage =
              Number(process.env.MARKET_CAP_PERCENTAGE) || 0.2;
            console.log("marketCapPercentage", marketCapPercentage);

            if (pairInfo?.success) {
              const currentMarketCap = Number(pairInfo.data?.marketCap);

              console.log("currentMarketCap", currentMarketCap);

              // Check if market cap is less than 20% of the pair's market cap
              if (
                !isNaN(currentMarketCap) &&
                currentMarketCap < pair.marketCap * marketCapPercentage
              ) {
                console.log("hello");
                // Prepare alert message
                const alertMessage = `
  🚨 Low Market Cap Alert!
  
  Pair Address: ${pair.pairAddress}
  Current Market Cap: $${currentMarketCap}
  Chain: ${pair.chainId}
  
  ⚠️ Market cap has fallen below 20%
  `;

                const sendPromises = targetChannels.map(async (channelId) => {
                  try {
                    await bot.sendMessage(channelId, alertMessage, {
                      parse_mode: "HTML",
                      disable_web_page_preview: true,
                    });
                    console.log(`Alert sent to channel ${channelId}`);
                  } catch (error) {
                    console.error(
                      `Error sending alert to channel ${channelId}:`,
                      error
                    );
                  }
                });
                console.log(`Alert sent for pair ${pair.pairAddress}`);
                await Promise.all(sendPromises);
              }
            }
          } catch (error) {
            console.error(`Error processing pair ${pair.pairAddress}:`, error);
          }
        })
      );
    } catch (error) {
      console.error("Error in market cap monitoring:", error);
    }
  });
};
