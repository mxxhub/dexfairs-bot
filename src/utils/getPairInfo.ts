import axios from "axios";
import dotenv from "dotenv";
import { bot } from "../bot";

dotenv.config();

const MIN_MARKET_CAP = Number(process.env.MARKET_CAP_LOW) || 200000;

export const getPairInfo = async (chainId: string, pairAddress: string) => {
  try {
    const response = await axios.get(
      `https://api.dexscreener.io/latest/dex/pairs/${chainId}/${pairAddress}`
    );

    if (!response?.data) {
      return {
        success: false,
        message: "No data received from dexscreener",
      };
    }

    if (!response.data.pair) {
      return {
        success: false,
        message: "Pair data not found",
      };
    }

    const marketCap = Number(response?.data?.pair?.marketCap);
    if (isNaN(marketCap) || marketCap < MIN_MARKET_CAP) {
      return {
        success: false,
        message: `${response?.data?.pair?.chainId} ${response?.data?.pair?.pairAddress} Invalid market cap or below minimum requirement (${MIN_MARKET_CAP})`,
      };
    }

    const MIN_LIQUIDITY = Number(process.env.MIN_LIQUIDITY);
    const liquidity = Number(response?.data?.pair?.liquidity?.usd);
    const SCAM_CHANNEL = Number(process.env.SCAM_CHANNEL);

    const alertMessage = `
⚠️⚠️⚠️ <b>Scam Pair Detected</b> ⚠️⚠️⚠️

ChainId: ${chainId}
PairAddress: ${pairAddress}
Liquidity: ${liquidity}
`;

    if (liquidity < MIN_LIQUIDITY) {
      await bot.sendMessage(SCAM_CHANNEL, alertMessage, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
      return;
    }
    return {
      success: true,
      data: response.data.pair,
    };
  } catch (err) {
    console.log("Error fetching pair info: ", err);
  }
};
