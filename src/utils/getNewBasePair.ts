import {ethers} from "ethers";
import dotenv from "dotenv";
import {EventEmitter} from "events";
import {getNewPair} from "./getNewPair";

dotenv.config();

const baseRpcUrl =
  process.env.BASE_RPC_URL ||
  "wss://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY";

console.log("baseRpcUrl: ", baseRpcUrl);

const uniswapFactoryAddress =
  process.env.BASE_FACTORY_ADDRESS ||
  "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6"; // Uniswap V2 Factory on Base

console.log("uniswapfactoryaddress: ", uniswapFactoryAddress);

let factoryContract: ethers.Contract;
const eventEmitter = new EventEmitter();

const factoryABI = [
  "event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
];

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";
const createProvider = () => {
  return new ethers.WebSocketProvider(
    `wss://base-mainnet.g.alchemy.com/v2/V8ISqVqhzB4GYz50gdw18USiaJg9CGli`
  );
};

let provider = createProvider();
console.log("provider: ", provider);

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
    console.log("factoryContract: ", factoryContract);

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
        eventEmitter.emit("newPair", {token0, token1, pair});
      }
    );
  } catch (err) {
    console.log("Error getting new Base pair", err);
  }
};

getNewBasePair();

// Restart connection every 10 minutes
setInterval(getNewBasePair, 10 * 60 * 1000);

export {eventEmitter};
