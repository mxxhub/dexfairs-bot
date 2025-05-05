import axios from "axios";
import dotenv from "dotenv";
import { bot } from "../bot";

dotenv.config();

const MIN_MARKET_CAP = Number(process.env.MARKET_CAP_LOW) || 200000;

export const getPairInfo = async (chainId: string, pairAddress: string) => {
  try {
    const RATE_LIMIT_CHANNEL = Number(process.env.RATE_LIMIT_CHANNEL);
    const response = await axios.get(
      `https://api.dexscreener.io/latest/dex/pairs/${chainId}/${pairAddress}`
    );
    console.log("status code: ", response.status);
    console.log("status code in data", response.data);

    if (response?.status === 429) {
      try {
        bot.sendMessage(
          RATE_LIMIT_CHANNEL,
          `Rate limit exceeded: ${response?.statusText}`
        );
        return {
          success: false,
          message: "Rate limit exceeded",
        };
      } catch (err) {
        console.log("rate limit error: ", err);
      }
    }

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
    if (isNaN(marketCap)) {
      return {
        success: false,
        message: `${response?.data?.pair?.chainId} ${response?.data?.pair?.pairAddress} Invalid market cap`,
      };
    }

    return {
      success: true,
      data: response.data.pair,
    };
  } catch (err) {
    console.log("Error fetching pair info: ", err);
  }
};
