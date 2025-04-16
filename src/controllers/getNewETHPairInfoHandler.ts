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
    const checkToken = response.data.result[tokenAddress];

    if (!result) {
      console.log("No data returned");
      return;
    }
    const status = checkScam(checkToken);
    return { status, result };
  } catch (err) {
    console.log("Error checking if pair is scam one: ", err);
    return null;
  }
};

const monitorPair = async (eventEmitter: EventEmitter, network: string) => {
  try {
    eventEmitter.on("newPair", async ({ token0, token1, pair }) => {
      try {
        const pairAdd = pair.toString();
        console.log(`Received new pair on ${network}:`);
        console.log("token0:", token0, "token1:", token1, "pair:", pair);
        const [data1, data2] = await Promise.all([
          checkScamPair(network, token0),
          checkScamPair(network, token1),
        ]);
        if (!data1 || !data2) {
          console.log("Skipping due to missing token data");
          return;
        }
        console.log(
          "first status: ",
          data1.status,
          "second status: ",
          data2.status
        );

        if (data1.status || data2.status) {
          console.log("Scam Pair detected");

          const scamToken = data1.status ? token0 : token1;
          const scamData = data1.status ? data1.result : data2.result;

          let EXPLORER_URL = "";
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
          }

          const SCAM_CHANNEL = Number(process.env.SCAM_CHANNEL);
          const alertMessage = `
⚠️⚠️⚠️ <b>Scam Pair Detected</b> ⚠️⚠️⚠️

 - Honeypot : ${scamData.is_honeypot === "1" ? "Yes 🙅‍♂️" : "No ✅"}
 - Mintable : ${scamData.is_mintable === "1" ? "Yes 🙅‍♂️" : "No ✅"}
 - Ownership Reclaimable : ${
   scamData.can_take_back_ownership === "1" ? "Yes 🙅‍♂️" : "No ✅"
 }
 - Hidden Owner : ${scamData.hidden_owner === "1" ? "Yes 🙅‍♂️" : "No ✅"}
 - Slippage Modifiable : ${
   scamData.slippage_modifiable === "1" ? "Yes 🙅‍♂️" : "No ✅"
 }
 - Buy Tax >= 10% : ${parseFloat(scamData.buy_tax) >= 10 ? "Yes 🙅‍♂️" : "No ✅"}
 - Sell Tax >= 10% : ${parseFloat(scamData.sell_tax) >= 10 ? "Yes 🙅‍♂️" : "No ✅"}
 - Blacklisted : ${scamData.is_blacklisted === "1" ? "Yes 🙅‍♂️" : "No ✅"}
 - Cannot Sell All : ${scamData.cannot_sell_all === "1" ? "Yes 🙅‍♂️" : "No ✅"}
 - Transfer Pausable : ${
   scamData.transfer_pausable === "1" ? "Yes 🙅‍♂️" : "No ✅"
 }

<a href="https://dexscreener.com/${network}/${pair}">Dexscreener</a> | <a href="${EXPLORER_URL}">Explorer</a>
`;

          await bot.sendMessage(SCAM_CHANNEL, alertMessage, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
          });
        } else {
          setTimeout(async () => {
            const pairInfo = await getPairInfo(network, pairAdd);
            if (pairInfo && pairInfo.success) {
              // try {
              //                 const MIN_LIQUIDITY = Number(process.env.MIN_LIQUIDITY);
              //                 const SCAM_CHANNEL = Number(process.env.SCAM_CHANNEL);
              //                 console.log(pairInfo?.data?.liquidity.usd);
              //                 if (Number(pairInfo?.data?.liquidity.usd) < MIN_LIQUIDITY) {
              //                   const alertMessage = `
              // ⚠️⚠️⚠️ <b>Scam Pair Detected</b> ⚠️⚠️⚠️

              // ChainId: ${pairInfo?.data?.chainId}
              // PairAddress: ${pairInfo?.data?.pairAddress}
              // Liquidity: ${pairInfo?.data?.liquidity.usd}
              // `;
              //                   await bot.sendMessage(SCAM_CHANNEL, alertMessage, {
              //                     parse_mode: "HTML",
              //                     disable_web_page_preview: true,
              //                   });
              // }
              await sendToChannels(pairInfo.data);
              await saveData(pairInfo.data);
              // } catch (err) {
              //   console.log("Error sending or saving data:", err);
              // }
            } else {
              console.log("Error fetching pair info:", pairInfo?.message);
            }
          }, 5 * 60 * 1000); // 5 minutes
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
