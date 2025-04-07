import cron from "node-cron";
import { EventEmitter } from "events";
import {
  baseEventEmitter,
  ETHEventEmitter,
  BSCEventEmitter,
} from "../utils/getNewPair";
import { getPairInfo } from "../utils/getPairInfo";
import { sendToChannels } from "../utils/sendMsgChannel";
import { saveData } from "../db/contoller/saveData";
import { cronjobs, monitorPairMC } from "./marketCapCron";

const monitorPair = async (eventEmitter: EventEmitter, network: string) => {
  try {
    eventEmitter.on("newPair", async ({ token0, token1, pair }) => {
      try {
        const pairAdd = pair.toString();
        console.log(`Received new pair on ${network}:`);
        console.log("token0:", token0, "token1:", token1, "pair:", pair);

        setTimeout(async () => {
          const pairInfo = await getPairInfo(network, pairAdd);
          console.log(pairInfo);
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
        }, 5 * 60 * 1000); // 2 mins delay
      } catch (err) {
        console.error("Error fetching pair info:", err);
      }
    });
  } catch (err) {
    console.log("Error monitoring pair: ", err);
  }
};

export const getNewPairInfoHandler = () => {
  monitorPair(ETHEventEmitter, "ethereum");
  monitorPair(baseEventEmitter, "base");
  monitorPair(BSCEventEmitter, "bsc");
};
