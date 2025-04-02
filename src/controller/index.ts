import { getNewPairInfoHandler } from "./getNewETHPairInfoHandler";
import { startMarketCapMonitoring } from "./marketCapCron";

export const initAll = async () => {
  try {
    await getNewPairInfoHandler();
    await startMarketCapMonitoring();
  } catch (err) {
    console.log("Error in initAll:", err);
  }
};
