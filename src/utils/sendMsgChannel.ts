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
📍 Pair Info: <a href="${pairData?.url}">$${pairData.baseToken?.symbol} / ${
          pairData.quoteToken?.symbol
        }</a>

📈 Trading Info:
    • Market Cap: $${pairData.marketCap.toLocaleString() || "N/A"}
    • Native: ${pairData.priceNative.toLocaleString() || "N/A"}
    • USD: $${pairData.priceUsd.toLocaleString() || "N/A"}

💲 Base Token:
    • Address: <code>${pairData.baseToken?.address || "N/A"}</code>
    • Name: ${pairData.baseToken?.name || "N/A"}
    • Symbol: ${pairData.baseToken?.symbol || "N/A"}

💧 Liquidity:
    • USD: $${pairData.liquidity?.usd.toLocaleString() || "N/A"}
    • Base: ${pairData.liquidity?.base.toLocaleString() || "N/A"} ${
          pairData.baseToken?.symbol || ""
        }
    • Quote: ${pairData.liquidity?.quote.toLocaleString() || "N/A"} ${
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
