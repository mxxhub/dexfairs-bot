import { ethers } from "ethers";
import { EventEmitter } from "events";
import dotenv from "dotenv";

dotenv.config();

const BSC_FACTORY_ADDRESS = "0xca143ce32fe78f1f7019d7d551a6402fc5350c73"; // PancakeSwap V2 Factory

const eventEmitter = new EventEmitter();

const factoryABI = [
  "event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
];

const createProvider = () => {
  return new ethers.WebSocketProvider(
    "wss://fabled-tiniest-darkness.bsc.quiknode.pro/c8bc6d7da5e2149080ee07abff301064e7c73bc8/"
  );
};

let provider = createProvider();
console.log(provider);
let factoryContract = new ethers.Contract(
  "0xca143ce32fe78f1f7019d7d551a6402fc5350c73",
  factoryABI,
  provider
);

const getNewBscPair = () => {
  try {
    if (factoryContract) {
      factoryContract.removeAllListeners("PairCreated");
    }

    console.log("Listening for new pairs on BSC...");

    factoryContract.on("PairCreated", async (token0, token1, pair) => {
      console.log("New Pair Created!");
      console.log("Token0:", token0);
      console.log("Token1:", token1);
      console.log("Pair Address:", pair);

      eventEmitter.emit("newBscPair", { token0, token1, pair });
    });
  } catch (err) {
    console.log("Error listening for new BSC pairs:", err);
  }
};

// Start listening
getNewBscPair();

// Restart every 10 minutes (prevents WebSocket disconnection issues)
setInterval(getNewBscPair, 10 * 60 * 1000);

export { eventEmitter };
