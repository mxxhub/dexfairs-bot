import { ethers } from "ethers";
import dotenv from "dotenv";
import { EventEmitter } from "events";
import { getNewPair } from "./getNewPair";

dotenv.config();

let baseEventEmitter: EventEmitter = new EventEmitter();
let ETHEventEmitter: EventEmitter = new EventEmitter();

export const getNew = async () => {
  const baseProjectId = process.env.ALCHEMY_API_KEY || "";
  const baseFactoryAddress = process.env.BASE_FACTORY_ADDRESS || "";
  const ETHProjectId = process.env.INFURA_PROJECT_ID || "";
  const ETHFactoryAddress = process.env.FACTORY_ADDRESS || "";

  // Ensure that baseEventEmitter always has a valid EventEmitter
  baseEventEmitter =
    (await getNewPair("base", baseProjectId, baseFactoryAddress)) ||
    new EventEmitter();
  ETHEventEmitter =
    (await getNewPair("ETH", ETHProjectId, ETHFactoryAddress)) ||
    new EventEmitter();
};

// Call `getNew()` immediately when this file is imported
getNew();

export { baseEventEmitter, ETHEventEmitter };
