import cron from "node-cron";
import dotenv from "dotenv";
import { getPairDataFromDB } from "../db/contoller/getData";
import { getPairInfo } from "../utils/getPairInfo";
import { bot } from "../bot/index";
import { getTargetChannels } from "../utils/marketCapFilter";
import { deletePairData } from "../db/contoller/deletePairData";
import { IPair } from "../@types/global";

dotenv.config();

export let cronjobs: { job: cron.ScheduledTask; pairAddress: string }[] = [];
export const startMarketCapMonitoring = async () => {
  try {
    console.log("Monitoring MarketCap");
    const pairs = await getPairDataFromDB();
    if (pairs && pairs.length > 0) {
      for (let i = 0; i < pairs.length; i++) {
        const job = cron.schedule("5 * * * *", () => {
          monitorPairMC(pairs[i] as IPair);
        });
        cronjobs.push({ job: job, pairAddress: pairs[i].pairAddress });
      }
    }
  } catch (err) {
    console.log("Error in startMarketCapMonitoring:", err);
  }
};

export const monitorPairMC = async (pairData: IPair) => {
  const targetChannels = getTargetChannels(pairData.marketCap);
  const pairInfo = await getPairInfo(pairData.chainId, pairData.pairAddress);
  const marketCapPercentage = Number(process.env.MARKET_CAP_PERCENTAGE) || 0.5;

  if (pairInfo?.success) {
    const currentMarketCap = Number(pairInfo.data?.marketCap);
    console.log("currentMarketCap", currentMarketCap);

    // Check if market cap is less than 50% of the pair's market cap
    if (
      !isNaN(currentMarketCap) &&
      currentMarketCap < pairData.marketCap * marketCapPercentage
    ) {
      const alertMessage = `
🚨 All Time Low!

Pair Address: <code>${pairData.pairAddress}</code>
First Market Cap: $${pairData.marketCap}
Current Market Cap: $${currentMarketCap}
Chain: ${pairData.chainId}

⚠️ Market cap has fallen below ${marketCapPercentage * 100}%
`;

      for (let i = 0; i < targetChannels.length; i++) {
        try {
          await bot.sendMessage(Number(targetChannels[i]), alertMessage, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
          });
          console.log(`Alert sent to channel ${Number(targetChannels[i])}`);
        } catch (error) {
          console.error(
            `Error sending alert to channel ${Number(targetChannels[i])}:`,
            error
          );
        }
      }

      await deletePairData(pairData.pairAddress);

      for (let j = 0; j < cronjobs.length; j++) {
        const cronjob = cronjobs[j];
        if (cronjob.pairAddress === pairData.pairAddress) {
          cronjob.job.stop();
          console.log("cronjob is stopped");
        }
      }
    }
  }
};
