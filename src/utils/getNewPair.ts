import { ethers } from "ethers";
import dotenv from "dotenv";
import { EventEmitter } from "events";

dotenv.config();

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
      if (network === "ETH") {
        return new ethers.InfuraWebSocketProvider("mainnet", projectId);
      } else if (network === "base") {
        return new ethers.WebSocketProvider(
          `wss://base-mainnet.g.alchemy.com/v2/${projectId}`
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
            console.log("token0:", token0, "token1:", token1, "pair:", pair);
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

export { getNewPair };
