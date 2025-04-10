import { bot } from "../bot/index";
import { getTargetChannels } from "./marketCapFilter";

export const sendToChannels = async (pairData: any) => {
  try {
    const targetChannel = getTargetChannels(pairData.chainId);

    try {
      await bot.sendMessage(
        Number(targetChannel),
        `🔗 Chain: ${pairData.chainId || "Ethereum"}
📊 DEX: ${pairData.dexId || "Uniswap"}
📍 Pair Info: <a href="https://dexscreener.com/${pairData.chainId}/${
          pairData.pairAddress
        }">$${pairData.baseToken?.symbol} / ${pairData.quoteToken?.symbol}</a>

📈 Trading Info:
    • Market Cap: $${pairData.marketCap || "N/A"}
    • Native: ${pairData.priceNative || "N/A"}
    • USD: $${pairData.priceUsd || "N/A"}

💲 Base Token:
    • Address: <code>${pairData.baseToken?.address || "N/A"}</code>
    • Name: ${pairData.baseToken?.name || "N/A"}
    • Symbol: ${pairData.baseToken?.symbol || "N/A"}

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
      console.log(`Message sent successfully to ${targetChannel}`);
    } catch (error) {
      console.log(`Failed to send message to ${targetChannel}:`);
    }
    // Send to all channels
  } catch (error) {
    // console.error("Error in sendToChannels:", error);
    console.log("Error in sendToChannels:");
  }
};
