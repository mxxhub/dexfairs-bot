import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const projectId = process.env.INFURA_PROJECT_ID || "";
const uniswapFactoryAddress = process.env.FACTORY_ADDRESS || "";
const WETHAddress = process.env.WETH_ADDRESS || "";
const factoryABI = [
  "event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
];
const createProvider = () => {
  const provider = new ethers.InfuraWebSocketProvider("mainnet", projectId);
  return provider;
};

let provider = createProvider();
let factoryContract: ethers.Contract;
let updateTime = new Date().getTime() / 1000;

const reconnectProvider = async () => {
  if (factoryContract) {
    factoryContract.removeAllListeners("PairCreated");
  }
  console.log("Restarted the reconnect provider");
  provider = createProvider();
  setupFactoryContract();
};

const setupFactoryContract = () => {
  factoryContract = new ethers.Contract(
    uniswapFactoryAddress,
    factoryABI,
    provider
  );
  const checkTimes = {
    First: 5,
    Second: 15,
    Third: 30,
  };
  console.log("setupFactoryContract");

  factoryContract.on(
    "PairCreated",
    (token0: string, token1: string, pair: string, event: any): void => {
      console.log("token0: ", token0, "token1: ", token1, "pair: ", pair);
      // let ca: string | null = null;
      // if (token0.toLowerCase() === WETHAddress.toLowerCase()) {
      //   ca = token1;
      // } else if (token1.toLowerCase() === WETHAddress.toLowerCase()) {
      //   ca = token0;
      // }
      // if (ca) {
      // console.log(ca, pair);
      [checkTimes.First, checkTimes.Second, checkTimes.Third].forEach(
        async (time, index) => {
          setTimeout(async () => {
            updateTime = new Date().getTime() / 1000;
            console.log(
              `Check ${
                index + 1
              } for token: ${token0}, ${token1}, pair: ${pair}`
            );
            // await getPairInfo(
            //   "ethereum",
            //   "0x80F252974a2Bc1Db0a130cc72786aE751eA5354c"
            // );
          }, time * 60 * 1000);
        }
      );
      // }
    }
  );
};

setInterval(() => {
  const curTime = new Date().getTime() / 1000;
  if (curTime - updateTime > 20 * 60) {
    reconnectProvider();
    updateTime = curTime;
  }
}, 5 * 60 * 1000);
reconnectProvider();
