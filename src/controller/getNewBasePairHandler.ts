import { ethers } from "ethers";
import EventEmitter from "events";
import dotenv from "dotenv";

dotenv.config();

export const baseEventEmitter = new EventEmitter();

const BASE_RPC_URL = process.env.BASE_RPC_URL || "";
const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);
