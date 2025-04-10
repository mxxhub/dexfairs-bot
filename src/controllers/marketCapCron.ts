import cron from "node-cron";
import dotenv from "dotenv";
import { getPairDataFromDB } from "../db/controllers/getData";
import { getPairInfo } from "../utils/getPairInfo";
import { bot } from "../bot/index";
import {
  getChannelsforAlert,
  getTargetChannels,
} from "../utils/marketCapFilter";
import { IPair } from "../@types/global";
import { updatePair } from "../db/controllers/updatePairData";
import { updateFlag } from "../db/controllers/updateFlag";

dotenv.config();

export let cronjobs: { job: cron.ScheduledTask; pairAddress: string }[] = [];

export const startMarketCapMonitoring = async () => {
  try {
    console.log("Monitoring MarketCap");
    const job = cron.schedule("*/5 * * * *", async () => {
      const pairs = await getPairDataFromDB();
      if (pairs && pairs.length > 0) {
        for (let i = 0; i < pairs.length; i++) {
          monitorPairMC(pairs[i] as IPair);
          cronjobs.push({ job: job, pairAddress: pairs[i].pairAddress });
        }
      }
    });
  } catch (err) {
    console.log("Error in startMarketCapMonitoring:", err);
  }
};

export const monitorPairMC = async (pairData: IPair) => {
  const flag = pairData?.flag;
  const marketCap = Number(pairData?.marketCap);
  const targetChannel = getChannelsforAlert(marketCap, pairData.chainId);
  const pairInfo = await getPairInfo(pairData.chainId, pairData.pairAddress);
  const marketCapPercentage = 1 - Number(process.env.MARKET_CAP_PERCENTAGE);

  if (pairInfo?.success) {
    if (marketCap < pairInfo?.data.marketCap) {
      await updatePair(pairInfo.data.pairAddress, pairInfo.data.marketCap);

      const allTimeHighAlertMessage = `
🚨🚨🚨 All Time High! 🚨🚨🚨

🔗 Chain: ${pairData.chainId}
📍 Pair Info: <a href="${pairInfo?.data?.url}">$${
        pairInfo?.data?.baseToken?.symbol
      } / ${pairInfo?.data?.quoteToken?.symbol}</a>
👉 Previous MarketCap: ${marketCap.toLocaleString()}
👆 Current MarketCap: ${pairInfo?.data.marketCap.toLocaleString()}

ℹ️ Market cap has increased ℹ️
`;

      try {
        const targetChannel = getTargetChannels(pairData.chainId);
        await bot.sendMessage(Number(targetChannel), allTimeHighAlertMessage, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
        await updateFlag(pairData.pairAddress, true);
        console.log(`Alert sent to channel ${targetChannel}`);
      } catch (error) {
        console.error(
          `Error sending all time high alert to channel ${targetChannel}:`,
          error
        );
      }
    }

    console.log("succeed in getting pair info");
    const currentMarketCap = Number(pairInfo.data?.marketCap);

    if (
      flag &&
      !isNaN(currentMarketCap) &&
      currentMarketCap < marketCap * marketCapPercentage
    ) {
      if (targetChannel.length > 0) {
        for (let i = 0; i < targetChannel.length; i++) {
          console.log(
            `market cap is less than ${marketCapPercentage}% of the pair's market cap`
          );
          const allTimeLowAlertMessage = `
🚨🚨🚨 All Time Low! 🚨🚨🚨

🔗 Chain: ${pairData.chainId}
📍 Pair Info: <a href="${pairInfo?.data?.url}">$${
            pairInfo?.data?.baseToken?.symbol
          } / ${pairInfo?.data?.quoteToken?.symbol}</a>
👉 Previous MarketCap: $${pairData.marketCap.toLocaleString()}
👇 Current MarketCap: $${currentMarketCap.toLocaleString()}

⚠️ Market cap has fallen more than ${marketCapPercentage * 100}% ⚠️
`;

          try {
            await bot.sendMessage(targetChannel[i], allTimeLowAlertMessage, {
              parse_mode: "HTML",
              disable_web_page_preview: true,
            });

            await updateFlag(pairData.pairAddress, false);
            console.log(`Alert sent to channel ${targetChannel[i]}`);
          } catch (error) {
            console.error(
              `Error sending alert to channel ${targetChannel[i]}:`,
              error
            );
          }
        }
      }

      // await deletePairData(pairData.pairAddress);

      // for (let j = 0; j < cronjobs.length; j++) {
      //   const cronjob = cronjobs[j];
      //   if (cronjob.pairAddress === pairData.pairAddress) {
      //     cronjob.job.stop();
      //     console.log("cronjob is stopped");
      //   }
      // }
    }
  }
};

// import cron from "node-cron";
// import dotenv from "dotenv";
// import { getPairDataFromDB } from "../db/controllers/getData";
// import { getPairInfo } from "../utils/getPairInfo";
// import { bot } from "../bot/index";
// import { getTargetChannels } from "../utils/marketCapFilter";
// import { deletePairData } from "../db/controllers/deletePairData";
// import { IPair } from "../@types/global";

// dotenv.config();

// export let cronjobs: { job: cron.ScheduledTask; pairAddress: string }[] = [];
// export const startMarketCapMonitoring = async () => {
//   try {
//     console.log("Monitoring MarketCap");
//     const pairs = await getPairDataFromDB();
//     console.log("pairs", pairs);
//     if (pairs && pairs.length > 0) {
//       for (let i = 0; i < pairs.length; i++) {
//         const job = cron.schedule("*/5 * * * *", () => {
//           monitorPairMC(pairs[i] as IPair);
//         });
//         cronjobs.push({ job: job, pairAddress: pairs[i].pairAddress });
//       }
//     }
//   } catch (err) {
//     console.log("Error in startMarketCapMonitoring:", err);
//   }
// };

// export const monitorPairMC = async (pairData: IPair) => {
//   const targetChannels = getTargetChannels(
//     pairData.marketCap,
//     pairData.chainId
//   );
//   const pairInfo = await getPairInfo(pairData.chainId, pairData.pairAddress);
//   console.log("pairInfo", pairInfo);
//   const marketCapPercentage = Number(process.env.MARKET_CAP_PERCENTAGE) || 0.5;

//   if (pairInfo?.success) {
//     console.log("succeed in getting pair info");
//     const currentMarketCap = Number(pairInfo.data?.marketCap);
//     console.log("currentMarketCap", currentMarketCap);

//     // Check if market cap is less than 50% of the pair's market cap

//     const sendAlert = async () => {
//       try {
//         console.log("market cap is less than 50% of the pair's market cap");
//         const alertMessage = `
//   🚨 All Time Low!

//   Pair Address: <code>${pairData.pairAddress}</code>
//   Previous MarketCap: $${pairData.marketCap}
//   Current MarketCap: $${currentMarketCap}
//   Chain: ${pairData.chainId}

//   ⚠️ Market cap has fallen below ${marketCapPercentage * 100}%
//   `;

//         for (let i = 0; i < targetChannels.length; i++) {
//           try {
//             await bot.sendMessage(Number(targetChannels[i]), alertMessage, {
//               parse_mode: "HTML",
//               disable_web_page_preview: true,
//             });
//             console.log(`Alert sent to channel ${Number(targetChannels[i])}`);
//           } catch (error) {
//             console.error(
//               `Error sending alert to channel ${Number(targetChannels[i])}:`,
//               error
//             );
//           }
//         }

//         await deletePairData(pairData.pairAddress);

//         for (let j = 0; j < cronjobs.length; j++) {
//           const cronjob = cronjobs[j];
//           if (cronjob.pairAddress === pairData.pairAddress) {
//             cronjob.job.stop();
//             console.log("cronjob is stopped");
//           }
//         }
//       } catch (err) {
//         console.log("Error in sendAlert:", err);
//       }
//     };

//     if (
//       !isNaN(currentMarketCap) &&
//       currentMarketCap < pairData.marketCap * marketCapPercentage
//     ) {
//       await sendAlert();
//     }

//     if (isNaN(currentMarketCap) && pairData) {
//       await sendAlert();
//     }
//   }
// };
