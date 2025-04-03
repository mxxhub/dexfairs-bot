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
      if (network === "mainnet") {
        return new ethers.InfuraWebSocketProvider("mainnet", projectId);
      } else if (network === "base-mainnet") {
        return new ethers.WebSocketProvider(
          `https://soft-thrilling-aura.base-mainnet.quiknode.pro/${projectId}`
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

        console.log("Restarted ETH provider connection");

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
