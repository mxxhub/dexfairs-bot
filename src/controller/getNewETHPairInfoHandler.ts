import cron from "node-cron";
import { eventEmitter } from "../utils/getNewETHPair";
import { getPairInfo } from "../utils/getPairInfo";
import { sendToChannels } from "../utils/sendMsgChannel";
import { saveData } from "../db/contoller/saveData";
import { cronjobs, monitorPairMC } from "./marketCapCron";

export const getNewPairInfoHandler = async () => {
  console.log("New pairs is been detecting.");
  eventEmitter.on("newPair", async ({ token0, token1, pair }) => {
    try {
      const pairAdd = pair.toString();
      console.log("Received new pair:");
      console.log("token0:", token0);
      console.log("token1:", token1);
      console.log("pair:", pair);

      setTimeout(async () => {
        const pairInfo = await getPairInfo("ethereum", pairAdd);

        if (pairInfo && pairInfo.success) {
          await sendToChannels(pairInfo.data)
            .then(async () => {
              await saveData(pairInfo.data)
                .then(() => {
                  // push to cronjobs array
                  const job = cron.schedule("*/5 * * * *", () => {
                    monitorPairMC(pairInfo.data);
                  });

                  cronjobs.push({ job: job, pairAddress: pairAdd });
                })
                .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
        } else {
          console.log("Error fetching pair info:", pairInfo?.message);
        }
      }, 2 * 60 * 1000); // 2 mins delay
    } catch (err) {
      console.error("Error fetching pair info:", err);
    }
  });
};
