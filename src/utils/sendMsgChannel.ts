import { bot } from "../bot/index";
import { getTargetChannels } from "./marketCapFilter";

const CHANNELS = {
  CHANNEL_1: process.env.CHANNEL_1 || "",
  CHANNEL_2: process.env.CHANNEL_2 || "",
  CHANNEL_3: process.env.CHANNEL_3 || "",
};

export const sendToChannels = async (pairData: any) => {
  try {
    const marketCap = Number(pairData?.marketCap);
    const targetChannels = getTargetChannels(marketCap);

    if (targetChannels.length > 0) {
      for (let i = 0; i < targetChannels.length; i++) {
        try {
          await bot.sendMessage(
            Number(targetChannels[i]),
            `
  🔗 Chain: ${pairData.chainId || "Ethereum"}
  📊 DEX: ${pairData.dexId || "Uniswap"}
  📍 Pair Address: <code>${pairData.pairAddress || "N/A"}</code>
  
  💠 Base Token:
     • Address: <code>${pairData.baseToken?.address || "N/A"}</code>
     • Name: ${pairData.baseToken?.name || "N/A"}
     • Symbol: ${pairData.baseToken?.symbol || "N/A"}
  
  💱 Quote Token:
     • Address: <code>${pairData.quoteToken?.address || "N/A"}</code>
     • Name: ${pairData.quoteToken?.name || "N/A"}
     • Symbol: ${pairData.quoteToken?.symbol || "N/A"}
  
  💰 Price:
     • Native: ${pairData.priceNative || "N/A"}
     • USD: $${pairData.priceUsd || "N/A"}
  
  📈 Trading Info:
     • Market Cap: $${pairData.marketCap || "N/A"}
  
  💧 Liquidity:
     • USD: $${pairData.liquidity?.usd || "N/A"}
     • Base: ${pairData.liquidity?.base || "N/A"} ${
              pairData.baseToken?.symbol || ""
            }
     • Quote: ${pairData.liquidity?.quote || "N/A"} ${
              pairData.quoteToken?.symbol || ""
            }
  
  ⏰ Created: ${new Date(pairData.pairCreatedAt).toLocaleString()}`,
            {
              parse_mode: "HTML",
              disable_web_page_preview: true,
            }
          );
          console.log(`Message sent successfully to ${targetChannels[i]}`);
        } catch (error) {
          console.log(`Failed to send message to ${targetChannels[i]}:`);
        }
      }
    }
    // Send to all channels
  } catch (error) {
    // console.error("Error in sendToChannels:", error);
    console.log("Error in sendToChannels:");
  }
};
