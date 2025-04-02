import { ethers } from "ethers";
import { EventEmitter } from "events";
import dotenv from "dotenv";

dotenv.config();

const baseEventEmitter = new EventEmitter();

// Use Alchemy WebSocket if possible
const BASE_WSS_URL = process.env.BASE_WSS_URL || "wss://mainnet.base.org";
const provider = new ethers.WebSocketProvider(BASE_WSS_URL);

const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS || "";
const FACTORY_ABI = [
  "event PairCreated(address indexed token0, address indexed token1, address pair, uint256)",
];

const factoryContract = new ethers.Contract(
  FACTORY_ADDRESS,
  FACTORY_ABI,
  provider
);

export const getNewBasePair = async () => {
  console.log("Listening for new pairs on Base...");

  factoryContract.on("PairCreated", (token0, token1, pair) => {
    console.log("New Base Pair Detected!");
    console.log("Token0:", token0);
    console.log("Token1:", token1);
    console.log("Pair:", pair);

    baseEventEmitter.emit("newBasePair", { token0, token1, pair });
  });

  provider._websocket.on("error", (err) => {
    console.error("WebSocket error:", err);
  });

  provider._websocket.on("close", () => {
    console.warn("WebSocket closed! Reconnecting...");
    setTimeout(getNewBasePair, 5000);
  });
};

getNewBasePair();

export { baseEventEmitter };
