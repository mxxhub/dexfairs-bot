import { getNewPairInfoHandler } from "./getNewETHPairInfoHandler";
import { startMarketCapMonitoring } from "./marketCapCron";
import { deleteDaily } from "../controller/deleteweekly";

export const initAll = async () => {
  try {
    await getNewPairInfoHandler();
    await startMarketCapMonitoring();
    await deleteDaily();
  } catch (err) {
    console.log("Error in initAll:", err);
  }
};
