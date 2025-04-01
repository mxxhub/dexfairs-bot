import { bot } from "../bot/index";
import { checkMarketCapDrops, getTargetChannels } from "./marketCapFilter";

const CHANNELS = {
  CHANNEL_1: process.env.CHANNEL_1 || "",
  CHANNEL_2: process.env.CHANNEL_2 || "",
  CHANNEL_3: process.env.CHANNEL_3 || "",
};

export const sendToChannels = async (pairData: any) => {
  try {
    const marketCap = Number(pairData?.marketCap);
    const targetChannels = getTargetChannels(marketCap);
    const dropAlerts = checkMarketCapDrops(marketCap);

    for (const alert of dropAlerts) {
      for (const channelId of alert.channels) {
        await bot.sendMessage(channelId, alert.message, {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        });
      }
    }

    if (targetChannels.length === 0) {
      console.log(`No channels match market cap: ${marketCap}`);
      return;
    }
    // Send to all channels
    const sendPromises = targetChannels.map(async (channelId) => {
      try {
        await bot.sendMessage(
          channelId,
          `
🔗 Chain: ${pairData.chainId || "Ethereum"}
📊 DEX: ${pairData.dexId || "Uniswap"}
📍 Pair Address: \`${pairData.pairAddress || "N/A"}\`

💠 Base Token:
   • Address: \`${pairData.baseToken?.address || "N/A"}\`
   • Name: ${pairData.baseToken?.name || "N/A"}
   • Symbol: ${pairData.baseToken?.symbol || "N/A"}

💱 Quote Token:
   • Address: \`${pairData.quoteToken?.address || "N/A"}\`
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
        console.log(`Message sent successfully to ${channelId}`);
      } catch (error) {
        // console.error(`Failed to send message to ${channelId}:`, error);
        console.log(`Failed to send message to ${channelId}:`);
      }
    });

    // Wait for all messages to be sent
    await Promise.all(sendPromises);
  } catch (error) {
    // console.error("Error in sendToChannels:", error);
    console.log("Error in sendToChannels:");
  }
};

export const sendMessage = async (msg: any, pairData: any) => {
  await bot.sendMessage(
    msg,
    `
🔗 Chain: ${pairData.chainId || "Ethereum"}
📊 DEX: ${pairData.dexId || "Uniswap"}
📍 Pair Address: \`${pairData.pairAddress || "N/A"}\`

💠 Base Token:
• Address: \`${pairData.baseToken?.address || "N/A"}\`
• Name: ${pairData.baseToken?.name || "N/A"}
• Symbol: ${pairData.baseToken?.symbol || "N/A"}

💱 Quote Token:
• Address: \`${pairData.quoteToken?.address || "N/A"}\`
• Name: ${pairData.quoteToken?.name || "N/A"}
• Symbol: ${pairData.quoteToken?.symbol || "N/A"}

💰 Price:
• Native: ${pairData.priceNative || "N/A"}
• USD: $${pairData.priceUsd || "N/A"}

📈 Trading Info:
• Market Cap: $${pairData.marketCap || "N/A"}

💧 Liquidity:
• USD: $${pairData.liquidity?.usd || "N/A"}
• Base: ${pairData.liquidity?.base || "N/A"} ${pairData.baseToken?.symbol || ""}
• Quote: ${pairData.liquidity?.quote || "N/A"} ${
      pairData.quoteToken?.symbol || ""
    }

⏰ Created: ${new Date(pairData.pairCreatedAt).toLocaleString()}`,
    {
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }
  );
};
