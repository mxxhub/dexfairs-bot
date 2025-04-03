import { ethers } from "ethers";
import dotenv from "dotenv";
import { EventEmitter } from "events";

dotenv.config();

let baseEventEmitter: EventEmitter = new EventEmitter();
let ETHEventEmitter: EventEmitter = new EventEmitter();
let BSCEventEmitter: EventEmitter = new EventEmitter();

const getNewPair = (
  network: string,
  projectId: string,
  factoryAddress: string
) => {
  try {
    if (!projectId || !factoryAddress) return;

    let factoryContract: ethers.Contract;
    const eventEmitter = new EventEmitter();

    const factoryABI = [
      "event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
    ];

    const createProvider = () => {
      if (network === "ethereum") {
        return new ethers.InfuraWebSocketProvider("mainnet", projectId);
      } else if (network === "base") {
        return new ethers.WebSocketProvider(
          `wss://base-mainnet.g.alchemy.com/v2/${projectId}`
        );
      } else if (network === "bsc") {
        return new ethers.WebSocketProvider(
          `wss://fabled-tiniest-darkness.bsc.quiknode.pro/${projectId}`
        );
      } else {
        console.log(`Unsupported network: ${network}`);
      }
    };

    let provider = createProvider();

    const listenForPairs = () => {
      try {
        if (factoryContract) {
          factoryContract.removeAllListeners("PairCreated");
        }

        console.log(`Restarted ${network} provider connection`);

        factoryContract = new ethers.Contract(
          factoryAddress,
          factoryABI,
          provider
        );

        factoryContract.on(
          "PairCreated",
          async (token0: string, token1: string, pair: string) => {
            console.log(
              "New Pair Created on",
              network,
              "token0:",
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
        console.log("Error getting New ETH Par", err);
      }
    };

    listenForPairs();

    setInterval(listenForPairs, 10 * 60 * 1000);

    return eventEmitter;
  } catch (err) {
    console.log("Error getting new pair", err);
  }
};

export const getNew = async () => {
  const baseProjectId = process.env.ALCHEMY_API_KEY || "";
  const baseFactoryAddress = process.env.BASE_FACTORY_ADDRESS || "";
  const ETHProjectId = process.env.INFURA_PROJECT_ID || "";
  const ETHFactoryAddress = process.env.FACTORY_ADDRESS || "";
  const BSCFactoryAddress = process.env.BSC_FACTORY_ADDRESS || "";
  const BSCProjectId = process.env.BSC_API_KEY || "";

  // Ensure that baseEventEmitter always has a valid EventEmitter
  baseEventEmitter =
    (await getNewPair("base", baseProjectId, baseFactoryAddress)) ||
    new EventEmitter();
  ETHEventEmitter =
    (await getNewPair("ethereum", ETHProjectId, ETHFactoryAddress)) ||
    new EventEmitter();
  BSCEventEmitter =
    (await getNewPair("bsc", BSCProjectId, BSCFactoryAddress)) ||
    new EventEmitter();
};

// Call `getNew()` immediately when this file is imported
getNew();

export { baseEventEmitter, ETHEventEmitter, BSCEventEmitter };
