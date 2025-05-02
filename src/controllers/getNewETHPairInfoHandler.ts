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
import { checkQuickIntel } from "../utils/checkQuickIntel";

dotenv.config();

const checkScamPair = async (
  chainId: string,
  tokenAddress: string,
  pair: string
) => {
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
    const apiUrl = `https://api.honeypot.is/v2/IsHoneypot?address=${pair}&pair=${pair}&chainID=${CHAINID}`;
    const delay = (ms: number) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };

    await delay(10000);

    const response = await axios.get(apiUrl);
    const data = response.data;

    if (!response) {
      console.log("No data returned");
      return;
    }
    const status = checkScam(data);
    return { status, data };
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
        console.log(
          "Received new pair on ",
          network,
          ": token0:",
          token0,
          "token1:",
          token1,
          "pair:",
          pair
        );
        // const [data1, data2] = await Promise.all([
        //   checkScamPair(network, token0, pair),
        //   checkScamPair(network, token1, pair),
        // ]);
        const [data1, data2] = await Promise.all([
          checkQuickIntel(network, token0),
          checkQuickIntel(network, token1),
        ]);
        console.log(data1?.status, data2?.status);
        if (!data1 || !data2) {
          console.log("Skipping due to missing token data");
          return;
        }

        if (data1.status || data2.status) {
          console.log("Scam Pair detected");

          const scamToken = data1.status ? token0 : token1;
          const scamData = data1.status ? data1.data : data2.data;

          let EXPLORER_URL = "";
          let CHAINID: number = 0;
          const eth_chain_id = Number(process.env.ETH_CHAIN_ID);
          const bnb_chain_id = Number(process.env.BNB_CHAIN_ID);
          const base_chain_id = Number(process.env.BASE_CHAIN_ID);
          switch (network) {
            case "ethereum":
              EXPLORER_URL = `https://etherscan.io/address/${scamToken}`;
              CHAINID = eth_chain_id;
              break;
            case "bsc":
              EXPLORER_URL = `https://bscscan.com/address/${scamToken}`;
              CHAINID = bnb_chain_id;
              break;
            case "base":
              EXPLORER_URL = `https://basescan.org/address/${scamToken}`;
              CHAINID = base_chain_id;
              break;
          }
          const SCAM_CHANNEL = Number(process.env.SCAM_CHANNEL);
          const alertMessage = `
⚠️⚠️⚠️ <b>Scam Pair Detected</b> ⚠️⚠️⚠️

 - Honeypot : ${
   scamData?.tokenDynamicDetails?.is_Honeypot === true ? "🚫" : "✅"
 }
 - Buy Tax >= 10% : ${
   parseFloat(scamData?.tokenDynamicDetails?.buyTax || "0") > 10 ? "🚫" : "✅"
 }
 - Sell Tax >= 10% : ${
   parseFloat(scamData?.tokenDynamicDetails?.sellTax || "0") > 10 ? "🚫" : "✅"
 }
 - Has whitelist : ${
   scamData?.quickiAudit?.can_Whitelist === true ? "🚫" : "✅"
 }
 - Trading cooldown : ${
   scamData?.quickiAudit?.has_Trading_Cooldown === true ? "🚫" : "✅"
 }
 - Transfer pausable : ${
   scamData?.quickiAudit?.is_Transfer_Pausable === true ? "🚫" : "✅"
 }
 - Mintable : ${scamData?.quickiAudit?.can_Mint === true ? "🚫" : "✅"}
 - Proxy contract : ${scamData?.quickiAudit?.is_Proxy === true ? "🚫" : "✅"}
 - Has obfuscated address : ${
   scamData?.quickiAudit?.has_Obfuscated_Address_Risk === true ? "🚫" : "✅"
 }
 - Hidden owner : ${scamData?.quickiAudit?.hidden_Owner === true ? "🚫" : "✅"}
 - Ownership renounced : ${
   scamData?.quickiAudit?.contract_Renounced === false ? "🚫" : "✅"
 }
 - Has suspicious functions : ${
   scamData?.quickiAudit?.has_Suspicious_Functions === true ? "🚫" : "✅"
 }

🔍 Scanners 🔍
<a href="https://honeypot.is/${network}?address=${scamToken}">Honeypot.is</a> | <a href="https://tokensniffer.com/token/${CHAINID}/${scamToken}">Token Sniffer</a>

<a href="https://dexscreener.com/${network}/${scamToken}">Dexscreener</a> | <a href="${EXPLORER_URL}">Explorer</a>
`;

          await bot.sendMessage(SCAM_CHANNEL, alertMessage, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
          });
        } else {
          setTimeout(async () => {
            const pairInfo = await getPairInfo(network, pairAdd);
            const ALL_PAIR_CHANNEL = Number(process.env.ALL_PAIR_CHANNEL);
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
              try {
                await bot.sendMessage(
                  ALL_PAIR_CHANNEL,
                  `
🔗 Chain: ${pairInfo?.data?.chainId || "Ethereum"}
📍 Pair Info: <a href="${pairInfo?.data?.url}">${
                    pairInfo?.data?.baseToken?.symbol
                  } / ${pairInfo.data?.quoteToken?.symbol}</a>
  
⏰ Created: ${new Date(pairInfo.data.pairCreatedAt).toLocaleString()}`,
                  {
                    parse_mode: "HTML",
                    disable_web_page_preview: true,
                  }
                );
              } catch (err) {
                console.log("Error sending message:", err);
              }
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
