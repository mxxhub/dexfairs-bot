import dotenv from "dotenv";

dotenv.config();

const MARKET_CAP_LOW = Number(process.env.MARKET_CAP_LOW) || 200;
const MARKET_CAP_MEDIUM = Number(process.env.MARKET_CAP_MEDIUM) || 500;
const MARKET_CAP_HIGH = Number(process.env.MARKET_CAP_HIGH) || 1000;

interface MarketCapRange {
  min: number;
  channelId: string;
}

interface DropAlert {
  channels: string[];
  message: string;
}

const DROP_THRESHOLD = 0.2;

const MARKET_CAP_RANGES: MarketCapRange[] = [
  {
    min: MARKET_CAP_LOW,
    channelId: process.env.CHANNEL_1 || "",
  }, // >200
  {
    min: MARKET_CAP_MEDIUM,
    channelId: process.env.CHANNEL_2 || "",
  }, // >500
  {
    min: MARKET_CAP_HIGH,
    channelId: process.env.CHANNEL_3 || "",
  }, // >1000
];

export const getTargetChannels = (marketCap: number): string[] => {
  if (isNaN(marketCap)) return [];

  // Filter channels where marketCap is greater than the minimum threshold
  return MARKET_CAP_RANGES.filter((range) => marketCap >= range.min)
    .map((range) => range.channelId)
    .filter((channelId) => channelId !== ""); // Remove empty channel IDs
};

export const checkMarketCapDrops = (marketCap: number): DropAlert[] => {
  if (isNaN(marketCap)) return [];

  const alerts: DropAlert[] = [];

  // Check for drops below 20% of each threshold
  if (marketCap < MARKET_CAP_LOW * DROP_THRESHOLD) {
    alerts.push({
      channels: [process.env.CHANNEL_1 || ""],
      message: `⚠️ Market cap ($${marketCap}) has dropped below 20% of LOW threshold ($${MARKET_CAP_LOW})`,
    });
  }

  if (marketCap < MARKET_CAP_MEDIUM * DROP_THRESHOLD) {
    alerts.push({
      channels: [process.env.CHANNEL_2 || ""],
      message: `⚠️ Market cap ($${marketCap}) has dropped below 20% of MEDIUM threshold ($${MARKET_CAP_MEDIUM})`,
    });
  }

  if (marketCap < MARKET_CAP_HIGH * DROP_THRESHOLD) {
    alerts.push({
      channels: [process.env.CHANNEL_3 || ""],
      message: `⚠️ Market cap ($${marketCap}) has dropped below 20% of HIGH threshold ($${MARKET_CAP_HIGH})`,
    });
  }

  return alerts.filter((alert) => alert.channels[0] !== "");
};
