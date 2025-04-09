import { getNewPairInfoHandler } from "./getNewETHPairInfoHandler";
import { startMarketCapMonitoring } from "./marketCapCron";
import { deleteDaily } from "./deleteweekly";

export const initAll = async () => {
  try {
    getNewPairInfoHandler();
    startMarketCapMonitoring();
    deleteDaily();
  } catch (err) {
    console.log("Error in initAll:", err);
  }
};
