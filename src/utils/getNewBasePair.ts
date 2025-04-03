import { ethers } from "ethers";
import dotenv from "dotenv";
import { EventEmitter } from "events";

dotenv.config();

// Use Alchemy, Ankr, QuickNode, or another WebSocket provider
const baseRpcUrl =
  process.env.BASE_RPC_URL ||
  "wss://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY";

const uniswapFactoryAddress =
  process.env.BASE_FACTORY_ADDRESS ||
  "0x4f4ebf7f1d19f2cdbfd3c4c5c9f1ef96bd86c8a0"; // Uniswap V2 Factory on Base

let factoryContract: ethers.Contract;
const eventEmitter = new EventEmitter();

const factoryABI = [
  "event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
];

const createProvider = () => {
  return new ethers.WebSocketProvider(baseRpcUrl);
};

let provider = createProvider();

const getNewBasePair = () => {
  try {
    if (factoryContract) {
      factoryContract.removeAllListeners("PairCreated");
    }

    console.log("Restarted Base provider connection");

    factoryContract = new ethers.Contract(
      uniswapFactoryAddress,
      factoryABI,
      provider
    );

    factoryContract.on(
      "PairCreated",
      async (token0: string, token1: string, pair: string) => {
        console.log(
          "New pair on Base - token0:",
          token0,
          "token1:",
          token1,
          "pair:",
          pair
        );
        eventEmitter.emit("newPair", { token0, token1, pair });
      }
    );
  } catch (err) {
    console.log("Error getting new Base pair", err);
  }
};

getNewBasePair();

// Restart connection every 10 minutes
setInterval(getNewBasePair, 10 * 60 * 1000);

export { eventEmitter };
