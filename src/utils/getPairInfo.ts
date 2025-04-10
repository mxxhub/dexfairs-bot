import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const MIN_MARKET_CAP = Number(process.env.MARKET_CAP_LOW) || 200000;

export const getPairInfo = async (chainId: string, pairAddress: string) => {
  try {
    const response = await axios.get(
      `https://api.dexscreener.io/latest/dex/pairs/${chainId}/${pairAddress}`
    );

    console.log("response of getting pair data: ", response.data.pair);

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

    return {
      success: true,
      data: response.data.pair,
    };
  } catch (err) {
    console.log("Error fetching pair info: ", err);
  }
};
