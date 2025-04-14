import { ethers } from "ethers";
import dotenv from "dotenv";
import { EventEmitter } from "events";
import { formatUnits } from "ethers";

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

    const pairABI = [
      "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    ];

    const erc20ABI = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function symbol() view returns (string)",
      "function name() view returns (string)",
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
            try {
              const pairContract = new ethers.Contract(pair, pairABI, provider);

              // Get reserves in smallest unit (e.g., 10^18 for most tokens)
              const { reserve0, reserve1 } = await pairContract.getReserves();

              // Get token contracts to fetch decimals
              const token0Contract = new ethers.Contract(
                token0,
                erc20ABI,
                provider
              );
              const token1Contract = new ethers.Contract(
                token1,
                erc20ABI,
                provider
              );

              // Fetch decimals for both tokens
              const [decimals0, decimals1] = await Promise.all([
                token0Contract.decimals(),
                token1Contract.decimals(),
              ]);

              // Convert reserves to actual token amounts based on decimals
              const amount0 = formatUnits(reserve0, decimals0); // formatted for token0
              const amount1 = formatUnits(reserve1, decimals1); // formatted for token1

              // Emit new pair event with formatted reserves
              eventEmitter.emit("newPair", {
                token0,
                token1,
                pair,
                liquidity: {
                  reserve0: amount0,
                  reserve1: amount1,
                },
              });
            } catch (err) {
              console.log("Error getting new pair", err);
            }
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
