import axios from "axios";
import dotenv from "dotenv";
import { EventEmitter } from "events";
import {
  baseEventEmitter,
  ETHEventEmitter,
  BSCEventEmitter,
} from "../utils/getNewPair";
import { getPairInfo } from "../utils/getPairInfo";
import { sendToChannels } from "../utils/sendMsgChannel";
import { saveData } from "../db/controllers/saveData";
import { checkScam } from "../utils/checkScam";
import { bot } from "../bot";

dotenv.config();

const checkScamPair = async (chainId: string, tokenAddress: string) => {
  try {
    const url = `https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${tokenAddress}`;
    const response = await axios.get(url);
    const result = response.data.result;
    if (!result) {
      console.log("No data returned");
      return null;
    }

    const status = checkScam(result);
    return status;
  } catch (err) {
    console.log("Error checking if pair is scam one: ", err);
  }
};

const monitorPair = async (eventEmitter: EventEmitter, network: string) => {
  try {
    eventEmitter.on("newPair", async ({ token0, token1, pair }) => {
      try {
        const pairAdd = pair.toString();
        console.log(`Received new pair on ${network}:`);
        console.log("token0:", token0, "token1:", token1, "pair:", pair);
        const status = await checkScamPair(network, token1);
        if (status) {
          setTimeout(async () => {
            const pairInfo = await getPairInfo(network, pairAdd);
            if (pairInfo && pairInfo.success) {
              await sendToChannels(pairInfo.data)
                .then(async () => {
                  await saveData(pairInfo.data);
                })
                .catch((err) => console.log(err));
            } else {
              console.log("Error fetching pair info:", pairInfo?.message);
            }
          }, 5 * 60 * 1000); // 5 mins delay
        } else {
          console.log("Scam Pair detected");
          const SCAM_CHANNEL = Number(process.env.SCAM_CHANNEL);
          const allTimeLowAlertMessage = `
🚨🚨🚨 Scam Pair Detected! 🚨🚨🚨

<a href="https://dexscreener.com/${network}/${pair}">Click here to view the Pair Information.</a>

⚠️ New Scam Pair Detected on ${network} ⚠️
`;
          await bot.sendMessage(SCAM_CHANNEL, allTimeLowAlertMessage, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
          });
        }
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
