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
    let CHAINID: number = 0;
    const eth_chain_id = Number(process.env.ETH_CHAIN_ID);
    const bnb_chain_id = Number(process.env.BNB_CHAIN_ID);
    const base_chain_id = Number(process.env.BASE_CHAIN_ID);
    switch (chainId) {
      case "ethereum":
        CHAINID = eth_chain_id;
        break;

      case "base":
        CHAINID = base_chain_id;
        break;
      case "bsc":
        CHAINID = bnb_chain_id;
        break;
      default:
        break;
    }
    const url = `https://api.gopluslabs.io/api/v1/token_security/${CHAINID}?contract_addresses=${tokenAddress}`;
    const response = await axios.get(url);
    const result = response.data.result;
    console.log("result: ", result);
    if (!result) {
      console.log("No data returned");
      return;
    }

    const status = checkScam(result);

    return { status: status, result: result };
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
        const data = await checkScamPair(network, token1);
        console.log("status: ", data?.status);
        if (!data?.status) {
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
          let EXPLORER_URL: string = "";
          switch (network) {
            case "ethereum":
              EXPLORER_URL = `https://etherscan.io/address/${pair}`;
              break;
            case "bsc":
              EXPLORER_URL = `https://bscscan.com/address/${pair}`;
              break;
            case "base":
              EXPLORER_URL = `https://basescan.org/address/${pair}`;
              break;
            default:
              break;
          }

          const SCAM_CHANNEL = Number(process.env.SCAM_CHANNEL);
          const allTimeLowAlertMessage = `
⚠️⚠️⚠️ Scam Pair Detected! ⚠️⚠️⚠️

 - Honeypot : ${data.result.is_honeypot == "1" ? "Yes 🙅‍♂️" : "No ✅"}
 - Mintable : ${data.result.is_mintable == "1" ? "Yes 🙅‍♂️" : "No ✅"}
 - Ownership : ${
   data.result.can_take_back_ownership == "1" ? "Yes 🙅‍♂️" : "No ✅"
 }
 - Hidden Owner : ${data.result.hidden_owner == "1" ? "Yes 🙅‍♂️" : "No ✅"}
 - Slippage Modifiable : ${
   data.result.slippage_modifiable == "1" ? "Yes 🙅‍♂️" : "No ✅"
 }
 - Buy Tax >= 10 : ${parseFloat(data.result.buy_tax) >= 10 ? "Yes 🙅‍♂️" : "No ✅"}
 - Sell Tax >= 10 : ${
   parseFloat(data.result.sell_tax) >= 10 ? "Yes 🙅‍♂️" : "No ✅"
 }
 - Blacklisted : ${data.result.is_blacklisted == "1" ? "Yes 🙅‍♂️" : "No ✅"}
 - Can not sell : ${data.result.cannot_sell_all == "1" ? "Yes 🙅‍♂️" : "No ✅"}
 - Transfer Pausable : ${
   data.result.transfer_pausable == "1" ? "Yes 🙅‍♂️" : "No ✅"
 }

<a href="https://dexscreener.com/${network}/${pair}">Dexscreener</a> | <a href="${EXPLORER_URL}">Explorer</a>
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
