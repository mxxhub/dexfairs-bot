import dotenv from "dotenv";

dotenv.config();

const MARKET_CAP_LOW = Number(process.env.MARKET_CAP_LOW) || 20000;
const MARKET_CAP_MEDIUM = Number(process.env.MARKET_CAP_MEDIUM) || 50000;
const MARKET_CAP_HIGH = Number(process.env.MARKET_CAP_HIGH) || 100000;

interface IChannel {
  network: string;
  channelId: string;
}

interface MarketCapRange {
  min: number;
  network: IChannel[];
}

const MARKET_CAP_RANGES: MarketCapRange[] = [
  {
    min: MARKET_CAP_LOW,
    network: [
      { network: "ethereum", channelId: process.env.ETH_CHANNEL_1 || "" },
      { network: "base", channelId: process.env.BASE_CHANNEL_1 || "" },
      { network: "bsc", channelId: process.env.BSC_CHANNEL_1 || "" },
    ],
  },
  {
    min: MARKET_CAP_MEDIUM,
    network: [
      { network: "ethereum", channelId: process.env.ETH_CHANNEL_2 || "" },
      { network: "base", channelId: process.env.BASE_CHANNEL_2 || "" },
      { network: "bsc", channelId: process.env.BSC_CHANNEL_2 || "" },
    ],
  },
  {
    min: MARKET_CAP_HIGH,
    network: [
      { network: "ethereum", channelId: process.env.ETH_CHANNEL_3 || "" },
      { network: "base", channelId: process.env.BASE_CHANNEL_3 || "" },
      { network: "bsc", channelId: process.env.BSC_CHANNEL_3 || "" },
    ],
  },
];

export const getTargetChannels = (
  marketCap: number,
  network: string
): string[] => {
  if (isNaN(marketCap)) return [];

  let channels: string[] = [];

  // Filter channels where marketCap is greater than the minimum threshold
  const filteredChannels = MARKET_CAP_RANGES.filter(
    (range) => marketCap >= range.min
  );
  for (let i = 0; i < filteredChannels.length; i++) {
    for (let j = 0; j < filteredChannels[i].network.length; j++) {
      if (filteredChannels[i].network[j].network === network) {
        channels.push(filteredChannels[i].network[j].channelId);
      }
    }
  }

  // filteredChannels.map((fc: MarketCapRange) =>
  //   channels.push(fc.channelId.toString())
  // );
  return channels;
};
