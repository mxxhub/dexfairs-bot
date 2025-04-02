import { ethers } from "ethers";
import dotenv from "dotenv";
import { EventEmitter } from "events";

dotenv.config();

const projectId = process.env.INFURA_PROJECT_ID || "";
const uniswapFactoryAddress = process.env.FACTORY_ADDRESS || "";
let factoryContract: ethers.Contract;
const eventEmitter = new EventEmitter();

const factoryABI = [
  "event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
];

const createProvider = () => {
  return new ethers.InfuraWebSocketProvider("mainnet", projectId);
};

let provider = createProvider();

const getNewPair = () => {
  if (factoryContract) {
    factoryContract.removeAllListeners("PairCreated");
  }

  console.log("Restarted the provider connection");

  factoryContract = new ethers.Contract(
    uniswapFactoryAddress,
    factoryABI,
    provider
  );

  factoryContract.on(
    "PairCreated",
    async (token0: string, token1: string, pair: string) => {
      const network = await provider.getNetwork();
      const chainId = network.chainId;
      console.log(
        "token0:",
        token0,
        "token1:",
        token1,
        "pair:",
        pair,
        "chainId:",
        chainId
      );
      eventEmitter.emit("newPair", { token0, token1, pair });
    }
  );
};

getNewPair();

setInterval(getNewPair, 10 * 60 * 1000);

export { eventEmitter };
