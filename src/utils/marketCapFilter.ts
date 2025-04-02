import dotenv from "dotenv";

dotenv.config();

const MARKET_CAP_LOW = Number(process.env.MARKET_CAP_LOW) || 200;
const MARKET_CAP_MEDIUM = Number(process.env.MARKET_CAP_MEDIUM) || 500;
const MARKET_CAP_HIGH = Number(process.env.MARKET_CAP_HIGH) || 1000;

interface MarketCapRange {
  min: number;
  channelId: string;
}

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
  const filteredChannels = MARKET_CAP_RANGES.filter(
    (range) => marketCap >= range.min
  );
  let channels: string[] = [];
  filteredChannels.map((fc: MarketCapRange) =>
    channels.push(fc.channelId.toString())
  ); // Remove empty channel IDs
  return channels;
};
